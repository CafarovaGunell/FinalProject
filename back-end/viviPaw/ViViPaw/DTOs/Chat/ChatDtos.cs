using System.ComponentModel.DataAnnotations;
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Chat;

public class ChatConversationGetDto
{
    public int Id { get; set; }

    public ChatType Type { get; set; }
    public string TypeText { get; set; } = string.Empty;

    public string? Title { get; set; }

    public int? PetId { get; set; }
    public int? ProductId { get; set; }
    public int? OrderId { get; set; }
    public int? AppointmentId { get; set; }

    public int? TargetUserId { get; set; }
    public string? TargetFullName { get; set; }
    public string? TargetEmail { get; set; }
    public string? TargetImageUrl { get; set; }

    public string? LastMessage { get; set; }
    public DateTime? LastMessageAt { get; set; }

    public int UnreadCount { get; set; }

    public bool IsClosed { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class ChatMessageGetDto
{
    public int Id { get; set; }

    public int ConversationId { get; set; }

    public int SenderUserId { get; set; }
    public string? SenderFullName { get; set; }
    public string? SenderImageUrl { get; set; }

    public string Message { get; set; } = string.Empty;

    public string? AttachmentUrl { get; set; }
    public string? AttachmentType { get; set; }

    public bool IsMine { get; set; }
    public bool IsDeletedForEveryone { get; set; }

    public DateTime CreatedAt { get; set; }
}

public class StartChatDto
{
    [Required]
    public ChatType Type { get; set; }
    public int? TargetUserId { get; set; }

    // Adoption
    public int? PetId { get; set; }
    public int? AdoptionRequestId { get; set; }

    // Shop / Vet direct fallback
    public int? PetShopId { get; set; }
    public int? VetProfileId { get; set; }

    // Context
    public int? ProductId { get; set; }
    public int? OrderId { get; set; }
    public int? AppointmentId { get; set; }

    [MaxLength(2000)]
    public string? InitialMessage { get; set; }
}

public class SendMessageDto
{
    [MaxLength(2000)]
    public string? Message { get; set; }

    [MaxLength(500)]
    public string? AttachmentUrl { get; set; }

    [MaxLength(50)]
    public string? AttachmentType { get; set; }
}



