using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Chat;
using ViViPaw.DTOs.Common;
using ViViPaw.Hubs;
using ViViPaw.Models.Chat;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class ChatService : IChatService
{
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;
    private readonly IHubContext<ChatHub> _hub;

    public ChatService(
        AppDbContext db,
        UserManager<AppUser> userManager,
        IHubContext<ChatHub> hub)
    {
        _db = db;
        _userManager = userManager;
        _hub = hub;
    }

    //PUBLIC METHODS
    public async Task<ApiResponse<List<ChatConversationGetDto>>> GetMyConversationsAsync(int userId)
    {
        var conversations = await _db.ChatConversations
            .AsNoTracking()
            .Include(x => x.Participants)
                .ThenInclude(x => x.User)
            .Where(x => x.Participants.Any(p => p.UserId == userId && !p.IsArchived))
            .OrderByDescending(x => x.LastMessageAt ?? x.CreatedAt)
            .ToListAsync();

        var result = new List<ChatConversationGetDto>();

        foreach (var c in conversations)
        {
            result.Add(await MapConversationAsync(c, userId));
        }

        return ApiResponse<List<ChatConversationGetDto>>.Ok(result);
    }

    public async Task<ApiResponse<List<ChatMessageGetDto>>> GetMessagesAsync(
    int userId,
    int conversationId,
    int page = 1,
    int pageSize = 50)
    {
        page = page <= 0 ? 1 : page;
        pageSize = pageSize <= 0 ? 50 : Math.Min(pageSize, 100);

        var conversation = await _db.ChatConversations
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == conversationId);

        if (conversation == null)
            return ApiResponse<List<ChatMessageGetDto>>.Fail("Söhbət tapılmadı");

        var participant = await _db.ChatParticipants
            .FirstOrDefaultAsync(x => x.ConversationId == conversationId && x.UserId == userId);

        if (participant == null)
        {
            participant = await EnsureParticipantAsync(userId, conversation);

            if (participant == null)
                return ApiResponse<List<ChatMessageGetDto>>.Fail("Bu söhbətə giriş icazəniz yoxdur");
        }

        var deletedForMeIds = _db.ChatMessageDeletions
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .Select(x => x.MessageId);

        var query = _db.ChatMessages
            .AsNoTracking()
            .Include(x => x.SenderUser)
            .Where(x => x.ConversationId == conversationId)
            .Where(x => !deletedForMeIds.Contains(x.Id));

        if (participant.ClearedAt.HasValue)
            query = query.Where(x => x.CreatedAt > participant.ClearedAt.Value);

        var messages = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = messages
            .OrderBy(x => x.CreatedAt)
            .Select(x => MapMessage(x, userId))
            .ToList();

        return ApiResponse<List<ChatMessageGetDto>>.Ok(result);
    }

    public async Task<ApiResponse<ChatConversationGetDto>> StartConversationAsync(
        int userId,
        StartChatDto dto)
    {
        var targetResult = await ResolveTargetUserIdAsync(userId, dto);

        if (!targetResult.Success)
            return ApiResponse<ChatConversationGetDto>.Fail(targetResult.Message);

        var targetUserId = targetResult.Data;

        if (targetUserId <= 0)
            return ApiResponse<ChatConversationGetDto>.Fail("Qarşı tərəf tapılmadı");

        if (targetUserId == userId)
            return ApiResponse<ChatConversationGetDto>.Fail("Özünüzlə chat başlada bilməzsiniz");

        var targetUser = await _db.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == targetUserId);

        if (targetUser == null)
            return ApiResponse<ChatConversationGetDto>.Fail("Qarşı tərəf istifadəçisi tapılmadı");

        var query = _db.ChatConversations
            .Include(x => x.Participants)
            .Where(x => x.Type == dto.Type)
            .Where(x =>
                x.PetId == dto.PetId &&
                x.ProductId == dto.ProductId &&
                x.OrderId == dto.OrderId &&
                x.AppointmentId == dto.AppointmentId)
            .Where(x =>
                x.Participants.Any(p => p.UserId == userId) &&
                x.Participants.Any(p => p.UserId == targetUserId));

        var conversation = await query.FirstOrDefaultAsync();

        if (conversation == null)
        {
            conversation = new ChatConversation
            {
                Type = dto.Type,
                Title = BuildConversationTitle(dto),
                PetId = dto.PetId,
                ProductId = dto.ProductId,
                OrderId = dto.OrderId,
                AppointmentId = dto.AppointmentId,
                LastMessageAt = DateTime.UtcNow,
                Participants = new List<ChatParticipant>
                {
                    new ChatParticipant
                    {
                        UserId = userId,
                        LastReadAt = DateTime.UtcNow
                    },
                    new ChatParticipant
                    {
                        UserId = targetUserId
                    }
                }
            };

            _db.ChatConversations.Add(conversation);
            await _db.SaveChangesAsync();
        }

        if (!string.IsNullOrWhiteSpace(dto.InitialMessage))
        {
            var msgDto = new SendMessageDto
            {
                Message = dto.InitialMessage.Trim()
            };

            await SendMessageAsync(userId, conversation.Id, msgDto);
        }

        var fullConversation = await _db.ChatConversations
            .AsNoTracking()
            .Include(x => x.Participants)
                .ThenInclude(x => x.User)
            .FirstAsync(x => x.Id == conversation.Id);

        var result = await MapConversationAsync(fullConversation, userId);

        return ApiResponse<ChatConversationGetDto>.Ok(result, "Söhbət açıldı");
    }

    public async Task<ApiResponse<ChatMessageGetDto>> SendMessageAsync(
        int userId,
        int conversationId,
        SendMessageDto dto)
    {
        var text = dto.Message?.Trim();

        if (string.IsNullOrWhiteSpace(text) && string.IsNullOrWhiteSpace(dto.AttachmentUrl))
            return ApiResponse<ChatMessageGetDto>.Fail("Mesaj boş ola bilməz");

        if (!string.IsNullOrWhiteSpace(text) && text.Length > 2000)
            return ApiResponse<ChatMessageGetDto>.Fail("Mesaj maksimum 2000 simvol ola bilər");

        var conversation = await _db.ChatConversations
            .Include(x => x.Participants)
            .FirstOrDefaultAsync(x => x.Id == conversationId);

        if (conversation == null)
            return ApiResponse<ChatMessageGetDto>.Fail("Söhbət tapılmadı");

        if (conversation.IsClosed)
            return ApiResponse<ChatMessageGetDto>.Fail("Bu söhbət bağlanıb");

        var participant = conversation.Participants.FirstOrDefault(x => x.UserId == userId);

        if (participant == null)
        {
            participant = await EnsureParticipantAsync(userId, conversation);

            if (participant == null)
                return ApiResponse<ChatMessageGetDto>.Fail("Bu söhbətə mesaj yazmaq icazəniz yoxdur");
        }

        var message = new ChatMessage
        {
            ConversationId = conversationId,
            SenderUserId = userId,
            Message = text ?? string.Empty,
            AttachmentUrl = dto.AttachmentUrl,
            AttachmentType = dto.AttachmentType
        };

        _db.ChatMessages.Add(message);

        conversation.LastMessage = !string.IsNullOrWhiteSpace(text)
            ? text.Length > 300 ? text[..300] : text
            : "Fayl göndərildi";

        conversation.LastMessageAt = DateTime.UtcNow;


        foreach (var p in conversation.Participants)
        {
            p.IsArchived = false;
        }


        participant.LastReadAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var fullMessage = await _db.ChatMessages
            .AsNoTracking()
            .Include(x => x.SenderUser)
            .FirstAsync(x => x.Id == message.Id);

        var result = MapMessage(fullMessage, userId);

        await _hub.Clients
            .Group(ChatHub.GroupName(conversationId))
            .SendAsync("ReceiveMessage", result);

        await _hub.Clients
            .Group(ChatHub.GroupName(conversationId))
            .SendAsync("ConversationUpdated", new
            {
                conversationId,
                lastMessage = conversation.LastMessage,
                lastMessageAt = conversation.LastMessageAt
            });

        return ApiResponse<ChatMessageGetDto>.Ok(result, "Mesaj göndərildi");
    }

    public async Task<ApiResponse<bool>> MarkAsReadAsync(int userId, int conversationId)
    {
        var participant = await _db.ChatParticipants
            .FirstOrDefaultAsync(x => x.ConversationId == conversationId && x.UserId == userId);

        if (participant == null)
            return ApiResponse<bool>.Fail("Söhbət tapılmadı");

        participant.LastReadAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        await _hub.Clients
            .Group(ChatHub.GroupName(conversationId))
            .SendAsync("ConversationRead", new
            {
                conversationId,
                userId,
                lastReadAt = participant.LastReadAt
            });

        return ApiResponse<bool>.Ok(true, "Oxundu kimi işarələndi");
    }

    //TARGET RESOLUTION 
    private async Task<ApiResponse<int>> ResolveTargetUserIdAsync(int currentUserId, StartChatDto dto)
    {
        // 1) Ən stabil yol — frontend targetUserId göndəribsə, birbaşa onu istifadə et
        if (dto.TargetUserId.HasValue)
            return ApiResponse<int>.Ok(dto.TargetUserId.Value);

        // 2) Mağaza ID göndərilibsə, mağazanın userini tap
        if (dto.PetShopId.HasValue)
            return await ResolvePetShopTargetAsync(dto.PetShopId.Value);

        // 3) Vet profile ID göndərilibsə, baytar userini tap
        if (dto.VetProfileId.HasValue)
            return await ResolveVetProfileTargetAsync(dto.VetProfileId.Value);

        // 4) Context üzrə əvvəlki məntiq
        return dto.Type switch
        {
            ChatType.PetAdoption => await ResolvePetAdoptionTargetAsync(currentUserId, dto),
            ChatType.Product => await ResolveProductTargetAsync(currentUserId, dto.ProductId),
            ChatType.Order => await ResolveOrderTargetAsync(currentUserId, dto.OrderId),
            ChatType.Appointment => await ResolveAppointmentTargetAsync(currentUserId, dto.AppointmentId),
            ChatType.Support => await ResolveSupportTargetAsync(currentUserId),
            _ => ApiResponse<int>.Fail("Qarşı tərəf seçilməyib")
        };
    }


    private async Task<ApiResponse<int>> ResolvePetAdoptionTargetAsync(int currentUserId, StartChatDto dto)
    {
        // Əgər adoptionRequestId varsa, ən düzgün qarşı tərəfi oradan tapırıq
        if (dto.AdoptionRequestId.HasValue)
        {
            var req = await _db.AdoptionRequests
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == dto.AdoptionRequestId.Value);

            if (req == null)
                return ApiResponse<int>.Fail("Sahiblənmə müraciəti tapılmadı");

            var applicantUserId = I(
                req,
                "ApplicantUserId",
                "UserId",
                "CustomerUserId",
                "RequesterUserId",
                "AdopterUserId"
            );

            var petId = dto.PetId ?? req.PetId;

            // Əgər hazırkı user applicant deyilsə, deməli sahib/mağaza tərəfidir → applicant-ə yazmalıdır
            if (applicantUserId.HasValue && currentUserId != applicantUserId.Value)
                return ApiResponse<int>.Ok(applicantUserId.Value);

            // Əgər hazırkı user applicantdirsə → heyvan sahibinə yazmalıdır
            return await ResolvePetTargetAsync(currentUserId, petId);
        }

        // Əks halda əvvəlki petId məntiqi
        return await ResolvePetTargetAsync(currentUserId, dto.PetId);
    }

    private async Task<ApiResponse<int>> ResolvePetTargetAsync(int currentUserId, int? petId)
    {
        if (!petId.HasValue)
            return ApiResponse<int>.Fail("PetId göndərilməlidir");

        var pet = await _db.Pets
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == petId.Value);

        if (pet == null)
            return ApiResponse<int>.Fail("Heyvan tapılmadı");

        var petShopId = I(pet, "PetShopId", "ShopId", "OwnerPetShopId");

        if (petShopId.HasValue)
        {
            var shop = await _db.PetShops
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == petShopId.Value);

            var shopUserId = UserIdFromEntity(shop);

            if (shopUserId.HasValue)
                return ApiResponse<int>.Ok(shopUserId.Value);
        }

        var ownerUserId = UserIdFromEntity(pet);

        if (ownerUserId.HasValue)
            return ApiResponse<int>.Ok(ownerUserId.Value);

        return ApiResponse<int>.Fail(
            $"Heyvan sahibinin istifadəçisi tapılmadı. PetId={pet.Id}, PetShopId={petShopId}"
        );
    }

    private async Task<ApiResponse<int>> ResolveProductTargetAsync(int currentUserId, int? productId)
    {
        if (!productId.HasValue)
            return ApiResponse<int>.Fail("ProductId göndərilməlidir");

        var product = await _db.Products
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == productId.Value);

        if (product == null)
            return ApiResponse<int>.Fail("Məhsul tapılmadı");

        var petShopId = I(product, "PetShopId", "ShopId");

        if (!petShopId.HasValue)
            return ApiResponse<int>.Fail("Məhsul mağazası tapılmadı");

        var shop = await _db.PetShops
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == petShopId.Value);

        if (shop == null)
            return ApiResponse<int>.Fail("Mağaza tapılmadı");

        var shopUserId = UserIdFromEntity(shop);

        return shopUserId.HasValue
            ? ApiResponse<int>.Ok(shopUserId.Value)
            : ApiResponse<int>.Fail($"Mağaza istifadəçisi tapılmadı. PetShopId={petShopId.Value}");
    }

    private async Task<ApiResponse<int>> ResolveOrderTargetAsync(int currentUserId, int? orderId)
    {
        if (!orderId.HasValue)
            return ApiResponse<int>.Fail("OrderId göndərilməlidir");

        var order = await _db.Orders
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == orderId.Value);

        if (order == null)
            return ApiResponse<int>.Fail("Sifariş tapılmadı");

        var customerUserId = I(order, "UserId", "CustomerUserId", "CustomerId");

        // Hazırkı user mağazadırsa, qarşı tərəf müştəridir
        var allShops = await _db.PetShops
            .IgnoreQueryFilters()
            .ToListAsync();

        var myShop = allShops.FirstOrDefault(s => UserIdFromEntity(s) == currentUserId);

        if (myShop != null && customerUserId.HasValue)
            return ApiResponse<int>.Ok(customerUserId.Value);

        // Hazırkı user müştəridirsə, sifarişdəki məhsuldan mağazanı tapırıq
        var orderItems = await _db.OrderItems
            .IgnoreQueryFilters()
            .Where(x => EF.Property<int>(x, "OrderId") == orderId.Value)
            .ToListAsync();

        var productIds = orderItems
            .Select(x => I(x, "ProductId"))
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .Distinct()
            .ToList();

        if (!productIds.Any())
            return ApiResponse<int>.Fail("Sifariş məhsulları tapılmadı");

        var firstProduct = await _db.Products
            .IgnoreQueryFilters()
            .Where(x => productIds.Contains(x.Id))
            .FirstOrDefaultAsync();

        if (firstProduct == null)
            return ApiResponse<int>.Fail("Sifariş məhsulu tapılmadı");

        var petShopId = I(firstProduct, "PetShopId", "ShopId");

        if (!petShopId.HasValue)
            return ApiResponse<int>.Fail("Sifariş mağazası tapılmadı");

        var shop = await _db.PetShops
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == petShopId.Value);

        var shopUserId = UserIdFromEntity(shop);

        return shopUserId.HasValue
            ? ApiResponse<int>.Ok(shopUserId.Value)
            : ApiResponse<int>.Fail($"Mağaza istifadəçisi tapılmadı. PetShopId={petShopId.Value}");
    }

    private async Task<ApiResponse<int>> ResolveAppointmentTargetAsync(int currentUserId, int? appointmentId)
    {
        if (!appointmentId.HasValue)
            return ApiResponse<int>.Fail("AppointmentId göndərilməlidir");

        var appt = await _db.VetAppointments
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == appointmentId.Value);

        if (appt == null)
            return ApiResponse<int>.Fail("Randevu tapılmadı");

        var customerUserId = I(appt, "UserId", "CustomerUserId", "CustomerId", "ApplicantUserId");

        var vetProfileId = I(appt, "VeterinarianProfileId", "VetProfileId");

        if (!vetProfileId.HasValue)
            return ApiResponse<int>.Fail("Baytar profili tapılmadı");

        var vetProfile = await _db.VeterinarianProfiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == vetProfileId.Value);

        var vetUserId = UserIdFromEntity(vetProfile);

        if (customerUserId.HasValue && currentUserId == customerUserId.Value && vetUserId.HasValue)
            return ApiResponse<int>.Ok(vetUserId.Value);

        if (vetUserId.HasValue && currentUserId == vetUserId.Value && customerUserId.HasValue)
            return ApiResponse<int>.Ok(customerUserId.Value);

        if (vetUserId.HasValue)
            return ApiResponse<int>.Ok(vetUserId.Value);

        return ApiResponse<int>.Fail("Randevunun qarşı tərəfi tapılmadı");
    }

    private async Task<ApiResponse<int>> ResolveSupportTargetAsync(int currentUserId)
    {
        var superAdmins = await _userManager.GetUsersInRoleAsync(Roles.SuperAdmin);
        var target = superAdmins.FirstOrDefault(x => x.Id != currentUserId);

        if (target != null)
            return ApiResponse<int>.Ok(target.Id);

        var admins = await _userManager.GetUsersInRoleAsync(Roles.Admin);
        target = admins.FirstOrDefault(x => x.Id != currentUserId);

        if (target != null)
            return ApiResponse<int>.Ok(target.Id);

        return ApiResponse<int>.Fail("Dəstək üçün admin tapılmadı");
    }

    // MAPPING
    private async Task<ChatConversationGetDto> MapConversationAsync(ChatConversation c, int currentUserId)
    {
        var targetParticipant = c.Participants.FirstOrDefault(x => x.UserId != currentUserId);
        var me = c.Participants.FirstOrDefault(x => x.UserId == currentUserId);

        var unreadQuery = _db.ChatMessages
            .AsNoTracking()
            .Where(x =>
                x.ConversationId == c.Id &&
                x.SenderUserId != currentUserId &&
                !x.IsDeletedForEveryone);

        if (me?.LastReadAt != null)
            unreadQuery = unreadQuery.Where(x => x.CreatedAt > me.LastReadAt);

        var unread = await unreadQuery.CountAsync();

        var targetUser = targetParticipant?.User;

        return new ChatConversationGetDto
        {
            Id = c.Id,

            Type = c.Type,
            TypeText = c.Type.ToString(),

            Title = c.Title,

            PetId = c.PetId,
            ProductId = c.ProductId,
            OrderId = c.OrderId,
            AppointmentId = c.AppointmentId,

            TargetUserId = targetUser?.Id,
            TargetFullName = S(targetUser, "FullName", "UserName", "Email"),
            TargetEmail = S(targetUser, "Email"),
            TargetImageUrl = S(targetUser, "ImageUrl", "ProfileImageUrl", "AvatarUrl"),

            LastMessage = c.LastMessage,
            LastMessageAt = c.LastMessageAt,

            UnreadCount = unread,

            IsClosed = c.IsClosed,
            CreatedAt = c.CreatedAt
        };
    }

    private ChatMessageGetDto MapMessage(ChatMessage m, int currentUserId)
    {
        return new ChatMessageGetDto
        {
            Id = m.Id,
            ConversationId = m.ConversationId,

            SenderUserId = m.SenderUserId,
            SenderFullName = S(m.SenderUser, "FullName", "UserName", "Email"),
            SenderImageUrl = S(m.SenderUser, "ImageUrl", "ProfileImageUrl", "AvatarUrl"),

            Message = m.IsDeletedForEveryone ? "Mesaj silinib" : m.Message,
            AttachmentUrl = m.IsDeletedForEveryone ? null : m.AttachmentUrl,
            AttachmentType = m.IsDeletedForEveryone ? null : m.AttachmentType,
            IsDeletedForEveryone = m.IsDeletedForEveryone,

            IsMine = m.SenderUserId == currentUserId,

            CreatedAt = m.CreatedAt
        };
    }

    private string? BuildConversationTitle(StartChatDto dto)
    {
        return dto.Type switch
        {
            ChatType.PetAdoption => dto.PetId.HasValue ? $"Heyvan elanı #{dto.PetId}" : "Heyvan elanı",
            ChatType.Product => dto.ProductId.HasValue ? $"Məhsul #{dto.ProductId}" : "Məhsul",
            ChatType.Order => dto.OrderId.HasValue ? $"Sifariş #{dto.OrderId}" : "Sifariş",
            ChatType.Appointment => dto.AppointmentId.HasValue ? $"Randevu #{dto.AppointmentId}" : "Randevu",
            ChatType.Support => "Dəstək",
            _ => "Söhbət"
        };
    }

    // REFLECTION HELPERS


    private static string? S(object? obj, params string[] names)
    {
        if (obj == null) return null;

        foreach (var name in names)
        {
            var prop = obj.GetType().GetProperty(name);
            var val = prop?.GetValue(obj)?.ToString();

            if (!string.IsNullOrWhiteSpace(val))
                return val;
        }

        return null;
    }

    private int? UserIdFromEntity(object? entity)
    {
        if (entity == null) return null;

        var clrType = entity.GetType();

        var entityType =
            _db.Model.FindEntityType(clrType) ??
            _db.Model.GetEntityTypes().FirstOrDefault(e =>
                e.ClrType == clrType ||
                e.ClrType.IsAssignableFrom(clrType) ||
                clrType.IsAssignableFrom(e.ClrType));

        if (entityType != null)
        {
            var appUserFk = entityType
                .GetForeignKeys()
                .FirstOrDefault(fk =>
                    fk.PrincipalEntityType.ClrType == typeof(AppUser) &&
                    fk.Properties.Count == 1);

            if (appUserFk != null)
            {
                var fkName = appUserFk.Properties[0].Name;
                var value = I(entity, fkName);

                if (value.HasValue)
                    return value.Value;
            }
        }

        return I(
            entity,
            "UserId",
            "OwnerUserId",
            "OwnerId",
            "AppUserId",
            "ApplicationUserId",
            "PetShopUserId",
            "ShopUserId",
            "VeterinarianUserId",
            "CustomerUserId",
            "ClientUserId",
            "CreatedByUserId",
            "CreatedById"
        );
    }

    private static int? I(object? obj, params string[] names)
    {
        if (obj == null) return null;

        foreach (var name in names)
        {
            var prop = obj.GetType().GetProperty(name);
            var val = prop?.GetValue(obj);

            if (val is int i) return i;

            if (val != null && int.TryParse(val.ToString(), out var parsed))
                return parsed;
        }

        return null;
    }


    public async Task<ApiResponse<bool>> DeleteConversationAsync(int userId, int conversationId)
    {
        var participant = await _db.ChatParticipants
            .FirstOrDefaultAsync(x => x.ConversationId == conversationId && x.UserId == userId);

        if (participant == null)
            return ApiResponse<bool>.Fail("Söhbət tapılmadı");

        participant.IsArchived = true;
        participant.ClearedAt = DateTime.UtcNow;
        participant.LastReadAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var allArchived = await _db.ChatParticipants
            .Where(x => x.ConversationId == conversationId)
            .AllAsync(x => x.IsArchived);

        if (allArchived)
        {
            var messages = await _db.ChatMessages
                .Where(x => x.ConversationId == conversationId)
                .ToListAsync();

            var messageIds = messages.Select(x => x.Id).ToList();

            var deletions = await _db.ChatMessageDeletions
                .Where(x => messageIds.Contains(x.MessageId))
                .ToListAsync();

            var participants = await _db.ChatParticipants
                .Where(x => x.ConversationId == conversationId)
                .ToListAsync();

            var conversation = await _db.ChatConversations
                .FirstOrDefaultAsync(x => x.Id == conversationId);

            _db.ChatMessageDeletions.RemoveRange(deletions);
            _db.ChatMessages.RemoveRange(messages);
            _db.ChatParticipants.RemoveRange(participants);

            if (conversation != null)
                _db.ChatConversations.Remove(conversation);

            await _db.SaveChangesAsync();
        }

        await _hub.Clients
            .Group(ChatHub.GroupName(conversationId))
            .SendAsync("ConversationDeleted", new
            {
                conversationId,
                userId
            });

        return ApiResponse<bool>.Ok(true, "Söhbət silindi");
    }

    public async Task<ApiResponse<bool>> DeleteMessageForMeAsync(int userId, int messageId)
    {
        var message = await _db.ChatMessages
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == messageId);

        if (message == null)
            return ApiResponse<bool>.Fail("Mesaj tapılmadı");

        var isParticipant = await _db.ChatParticipants
            .AnyAsync(x => x.ConversationId == message.ConversationId && x.UserId == userId);

        if (!isParticipant)
            return ApiResponse<bool>.Fail("Bu mesajı silmək icazəniz yoxdur");

        var exists = await _db.ChatMessageDeletions
            .AnyAsync(x => x.MessageId == messageId && x.UserId == userId);

        if (!exists)
        {
            _db.ChatMessageDeletions.Add(new ChatMessageDeletion
            {
                MessageId = messageId,
                UserId = userId
            });

            await _db.SaveChangesAsync();
        }

        return ApiResponse<bool>.Ok(true, "Mesaj sizdə silindi");
    }

    public async Task<ApiResponse<bool>> DeleteMessageForEveryoneAsync(int userId, int messageId)
    {
        var message = await _db.ChatMessages
            .FirstOrDefaultAsync(x => x.Id == messageId);

        if (message == null)
            return ApiResponse<bool>.Fail("Mesaj tapılmadı");

        if (message.SenderUserId != userId)
            return ApiResponse<bool>.Fail("Yalnız öz mesajınızı hamı üçün silə bilərsiniz");

        if (message.IsDeletedForEveryone)
            return ApiResponse<bool>.Ok(true, "Mesaj artıq silinib");

        message.IsDeletedForEveryone = true;
        message.Message = string.Empty;
        message.AttachmentUrl = null;
        message.AttachmentType = null;

        await _db.SaveChangesAsync();

        await _hub.Clients
            .Group(ChatHub.GroupName(message.ConversationId))
            .SendAsync("MessageDeleted", new
            {
                conversationId = message.ConversationId,
                messageId = message.Id,
                forEveryone = true
            });

        return ApiResponse<bool>.Ok(true, "Mesaj hamı üçün silindi");
    }


    private async Task<ChatParticipant?> EnsureParticipantAsync(int userId, ChatConversation conversation)
    {
        var participant = await _db.ChatParticipants
            .FirstOrDefaultAsync(x =>
                x.ConversationId == conversation.Id &&
                x.UserId == userId);

        if (participant != null)
            return participant;

        var canAccess = await CanAccessConversationAsync(userId, conversation);

        if (!canAccess)
            return null;

        participant = new ChatParticipant
        {
            ConversationId = conversation.Id,
            UserId = userId,
            LastReadAt = DateTime.UtcNow,
            IsArchived = false
        };

        _db.ChatParticipants.Add(participant);
        await _db.SaveChangesAsync();

        return participant;
    }

    private async Task<bool> CanAccessConversationAsync(int userId, ChatConversation conversation)
    {
        if (conversation.Type == ChatType.Appointment && conversation.AppointmentId.HasValue)
        {
            var appt = await _db.VetAppointments
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == conversation.AppointmentId.Value);

            if (appt == null) return false;

            var customerUserId = I(
                appt,
                "UserId",
                "CustomerUserId",
                "CustomerId",
                "ApplicantUserId",
                "ClientUserId"
            );

            if (customerUserId.HasValue && customerUserId.Value == userId)
                return true;

            var vetProfileId = I(appt, "VeterinarianProfileId", "VetProfileId");

            if (!vetProfileId.HasValue)
                return false;

            var vetProfile = await _db.VeterinarianProfiles
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == vetProfileId.Value);

            var vetUserId = UserIdFromEntity(vetProfile);

            return vetUserId.HasValue && vetUserId.Value == userId;
        }

        if (conversation.Type == ChatType.Order && conversation.OrderId.HasValue)
        {
            var order = await _db.Orders
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == conversation.OrderId.Value);

            if (order == null) return false;

            var customerUserId = I(order, "UserId", "CustomerUserId", "CustomerId");

            if (customerUserId.HasValue && customerUserId.Value == userId)
                return true;

            var orderItems = await _db.OrderItems
                .IgnoreQueryFilters()
                .Where(x => EF.Property<int>(x, "OrderId") == conversation.OrderId.Value)
                .ToListAsync();

            var productIds = orderItems
                .Select(x => I(x, "ProductId"))
                .Where(x => x.HasValue)
                .Select(x => x!.Value)
                .Distinct()
                .ToList();

            if (!productIds.Any()) return false;

            var products = await _db.Products
                .IgnoreQueryFilters()
                .Where(x => productIds.Contains(x.Id))
                .ToListAsync();

            var petShopIds = products
                .Select(x => I(x, "PetShopId", "ShopId"))
                .Where(x => x.HasValue)
                .Select(x => x!.Value)
                .Distinct()
                .ToList();

            if (!petShopIds.Any()) return false;

            var shops = await _db.PetShops
                .IgnoreQueryFilters()
                .Where(x => petShopIds.Contains(x.Id))
                .ToListAsync();

            return shops.Any(s => UserIdFromEntity(s) == userId);
        }

        if (conversation.Type == ChatType.Product && conversation.ProductId.HasValue)
        {
            var product = await _db.Products
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == conversation.ProductId.Value);

            if (product == null) return false;

            var petShopId = I(product, "PetShopId", "ShopId");

            if (!petShopId.HasValue) return false;

            var shop = await _db.PetShops
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == petShopId.Value);

            return UserIdFromEntity(shop) == userId;
        }

        if (conversation.Type == ChatType.PetAdoption && conversation.PetId.HasValue)
        {
            var pet = await _db.Pets
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == conversation.PetId.Value);

            if (pet == null) return false;

            var ownerUserId = UserIdFromEntity(pet);

            if (ownerUserId.HasValue && ownerUserId.Value == userId)
                return true;

            var petShopId = I(pet, "PetShopId", "ShopId");

            if (!petShopId.HasValue) return false;

            var shop = await _db.PetShops
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(x => x.Id == petShopId.Value);

            return UserIdFromEntity(shop) == userId;
        }

        // Direct və Support üçün participant olmadan avtomatik giriş vermirik
        return false;
    }


    private async Task<ApiResponse<int>> ResolvePetShopTargetAsync(int petShopId)
    {
        var shop = await _db.PetShops
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == petShopId);

        if (shop == null)
            return ApiResponse<int>.Fail("Mağaza tapılmadı");

        var userId = UserIdFromEntity(shop);

        return userId.HasValue
            ? ApiResponse<int>.Ok(userId.Value)
            : ApiResponse<int>.Fail($"Mağaza istifadəçisi tapılmadı. PetShopId={petShopId}");
    }

    private async Task<ApiResponse<int>> ResolveVetProfileTargetAsync(int vetProfileId)
    {
        var vet = await _db.VeterinarianProfiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Id == vetProfileId);

        if (vet == null)
            return ApiResponse<int>.Fail("Baytar profili tapılmadı");

        var userId = UserIdFromEntity(vet);

        return userId.HasValue
            ? ApiResponse<int>.Ok(userId.Value)
            : ApiResponse<int>.Fail($"Baytar istifadəçisi tapılmadı. VetProfileId={vetProfileId}");
    }


}




