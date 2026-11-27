
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Order;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Shop;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;
    private readonly INotificationService _notify;

    private const decimal ShippingFeeConst = 5m;
    private const decimal FreeShippingLimit = 50m;

    public OrderService(AppDbContext db, IMapper mapper, INotificationService notify)
    {
        _db = db;
        _mapper = mapper;
        _notify = notify;
    }

    // CHECKOUT 
    public async Task<ApiResponse<OrderGetDto>> CreateAsync(int userId, OrderCreateDto dto)
    {
        var cart = await _db.Carts
            .Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)
            .Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p.PetShop)
            .FirstOrDefaultAsync(c => c.AppUserId == userId);

        if (cart is null || !cart.Items.Any())
            return ApiResponse<OrderGetDto>.Fail("Səbətiniz boşdur.");

    
        foreach (var i in cart.Items)
        {
            if (!i.Product.IsActive)
                return ApiResponse<OrderGetDto>.Fail($"'{i.Product.Name}' artıq satışda deyil.");
            if (i.Quantity > i.Product.StockQuantity)
                return ApiResponse<OrderGetDto>.Fail($"'{i.Product.Name}' üçün anbarda {i.Product.StockQuantity} ədəd var.");
        }

        using var tx = await _db.Database.BeginTransactionAsync();

        var order = new Order
        {
            OrderNumber = $"VP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
            CustomerUserId = userId,

            ShippingFullName = dto.ShippingFullName,
            ShippingPhone = dto.ShippingPhone,
            ShippingCity = dto.ShippingCity,
            ShippingAddress = dto.ShippingAddress,
            Note = dto.Note,

            Status = OrderStatus.Pending,

            PaymentMethod = dto.PaymentMethod,

            /*
              Bu kurs/demo layihəsi üçün mock payment-dir.

              Kart seçildikdə sifarişi "Paid" kimi saxlayırıq.
              Real bank ödənişi və real transaction yoxdur.
            */
            PaymentStatus = dto.PaymentMethod == PaymentMethod.Card
        ? PaymentStatus.Paid
        : PaymentStatus.Unpaid
        };

        decimal subTotal = 0;

        foreach (var i in cart.Items)
        {
            var unitPrice = i.Product.DiscountPrice ?? i.Product.Price;
            subTotal += unitPrice * i.Quantity;

            order.Items.Add(new OrderItem
            {
                ProductId = i.ProductId,
                PetShopId = i.Product.PetShopId,
                ProductName = i.Product.Name,
                ProductImageUrl = i.Product.Images.OrderByDescending(im => im.IsMain).Select(im => im.ImageUrl).FirstOrDefault(),
                UnitPrice = unitPrice,
                Quantity = i.Quantity
            });

            i.Product.StockQuantity -= i.Quantity;   
        }

        order.SubTotal = subTotal;
        order.ShippingFee = subTotal >= FreeShippingLimit ? 0 : ShippingFeeConst;
        order.TotalAmount = order.SubTotal + order.ShippingFee;

        _db.Orders.Add(order);
        _db.CartItems.RemoveRange(cart.Items);     
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        // Mağazalara bildiriş
        var shopIds = order.Items.Select(x => x.PetShopId).Distinct().ToList();
        var shopOwners = await _db.PetShops.Where(s => shopIds.Contains(s.Id))
            .Select(s => new { s.Id, s.AppUserId, s.Name }).ToListAsync();

        foreach (var s in shopOwners)
            await _notify.CreateAsync(s.AppUserId, "Yeni sifariş",
                $"{order.OrderNumber} nömrəli yeni sifariş var.",
                NotificationType.OrderStatusChanged, $"/shop/orders/{order.Id}");

        var result = await _db.Orders.Where(x => x.Id == order.Id)
            .ProjectTo<OrderGetDto>(_mapper.ConfigurationProvider).FirstAsync();

        return ApiResponse<OrderGetDto>.Ok(result, "Sifarişiniz qeydə alındı.");
    }

    public async Task<ApiResponse<List<OrderGetDto>>> GetMyOrdersAsync(int userId)
    {
        var list = await _db.Orders.Where(x => x.CustomerUserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ProjectTo<OrderGetDto>(_mapper.ConfigurationProvider).ToListAsync();

        return ApiResponse<List<OrderGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<OrderGetDto>> GetByIdAsync(int userId, bool isAdmin, int orderId)
    {
        var order = await _db.Orders.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == orderId);
        if (order is null) return ApiResponse<OrderGetDto>.Fail("Sifariş tapılmadı.");

        if (!isAdmin && order.CustomerUserId != userId)
        {
            var shopId = await _db.PetShops.Where(s => s.AppUserId == userId).Select(s => (int?)s.Id).FirstOrDefaultAsync();
            if (shopId is null || !order.Items.Any(i => i.PetShopId == shopId))
                return ApiResponse<OrderGetDto>.Fail("İcazəniz yoxdur.");
        }

        var dto = await _db.Orders.Where(x => x.Id == orderId)
            .ProjectTo<OrderGetDto>(_mapper.ConfigurationProvider).FirstAsync();

        return ApiResponse<OrderGetDto>.Ok(dto);
    }

    ///Mağazaya gələn sifarişlər
    public async Task<ApiResponse<List<OrderGetDto>>> GetShopOrdersAsync(int userId, OrderStatus? status)
    {
        var shopId = await _db.PetShops.Where(s => s.AppUserId == userId).Select(s => (int?)s.Id).FirstOrDefaultAsync();
        if (shopId is null) return ApiResponse<List<OrderGetDto>>.Fail("Mağaza profiliniz yoxdur.");

        var q = _db.Orders.Where(o => o.Items.Any(i => i.PetShopId == shopId));
        if (status.HasValue) q = q.Where(o => o.Status == status);

        var list = await q.OrderByDescending(o => o.CreatedAt)
            .ProjectTo<OrderGetDto>(_mapper.ConfigurationProvider).ToListAsync();

        return ApiResponse<List<OrderGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<List<OrderGetDto>>> GetAllAsync(OrderStatus? status)
    {
        var q = _db.Orders.AsQueryable();
        if (status.HasValue) q = q.Where(o => o.Status == status);

        var list = await q.OrderByDescending(o => o.CreatedAt)
            .ProjectTo<OrderGetDto>(_mapper.ConfigurationProvider).ToListAsync();

        return ApiResponse<List<OrderGetDto>>.Ok(list);
    }

    // STATUS
    public async Task<ApiResponse<string>> UpdateStatusAsync(int userId, bool isAdmin, int orderId, UpdateOrderStatusDto dto)
    {
        var order = await _db.Orders.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == orderId);
        if (order is null) return ApiResponse<string>.Fail("Sifariş tapılmadı.");

        if (!isAdmin)
        {
            var shopId = await _db.PetShops.Where(s => s.AppUserId == userId).Select(s => (int?)s.Id).FirstOrDefaultAsync();
            if (shopId is null || !order.Items.Any(i => i.PetShopId == shopId))
                return ApiResponse<string>.Fail("İcazəniz yoxdur.");
        }

        if (order.Status is OrderStatus.Delivered or OrderStatus.Cancelled)
            return ApiResponse<string>.Fail("Bu sifarişin statusu artıq dəyişdirilə bilməz.");

        // Ləğv - stoku geri qaytar
        if (dto.Status == OrderStatus.Cancelled)
        {
            foreach (var i in order.Items)
            {
                var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == i.ProductId);
                if (p is not null) p.StockQuantity += i.Quantity;
            }
            order.CancelReason = dto.CancelReason;
        }


        if (order.PaymentMethod == PaymentMethod.Card &&
    order.PaymentStatus == PaymentStatus.Paid)
        {
            order.PaymentStatus = PaymentStatus.Refunded;
            order.RefundedAt = DateTime.UtcNow;
        }


        order.Status = dto.Status;
        await _db.SaveChangesAsync();

        await _notify.CreateAsync(order.CustomerUserId, "Sifariş statusu",
            $"{order.OrderNumber}: {Helpers.FormatHelpers.OrderStatusText(dto.Status)}",
            NotificationType.OrderStatusChanged, $"/my-orders/{order.Id}");

        return ApiResponse<string>.Ok("ok", "Status yeniləndi.");
    }

    /// Müştəri öz sifarişini ləğv edir
    public async Task<ApiResponse<string>> CancelAsync(int userId, int orderId, string? reason)
    {
        var order = await _db.Orders.Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == orderId && x.CustomerUserId == userId);
        if (order is null) return ApiResponse<string>.Fail("Sifariş tapılmadı.");

        if (order.Status is not (OrderStatus.Pending or OrderStatus.Confirmed))
            return ApiResponse<string>.Fail("Hazırlanan və ya göndərilən sifarişi ləğv edə bilməzsiniz.");

        foreach (var i in order.Items)
        {
            var p = await _db.Products.FirstOrDefaultAsync(x => x.Id == i.ProductId);
            if (p is not null) p.StockQuantity += i.Quantity;
        }
        order.Status = OrderStatus.Cancelled;
        order.CancelReason = reason ?? "Müştəri tərəfindən ləğv edildi.";

        /*
          Kartla demo ödəniş edilibsə,
          refund da demo olaraq tamamlanmış sayılır.

          Real payment gateway qoşulanda burada Stripe/Epoint/Azericard
          refund API-si çağırılmalıdır.
        */
        if (order.PaymentMethod == PaymentMethod.Card &&
            order.PaymentStatus == PaymentStatus.Paid)
        {
            order.PaymentStatus = PaymentStatus.Refunded;
            order.RefundedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return ApiResponse<string>.Ok(
    "ok",
    order.PaymentMethod == PaymentMethod.Card
        ? "Sifariş ləğv edildi. Ödənişiniz 1 həftə ərzində geri qaytarılacaq."
        : "Sifariş ləğv edildi."
);
    }
}


