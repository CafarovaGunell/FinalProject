
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.Order;
using ViViPaw.Models.Enums;

namespace ViViPaw.Services.Interfaces;

public interface IOrderService
{
    Task<ApiResponse<OrderGetDto>> CreateAsync(int userId, OrderCreateDto dto);
    Task<ApiResponse<List<OrderGetDto>>> GetMyOrdersAsync(int userId);
    Task<ApiResponse<OrderGetDto>> GetByIdAsync(int userId, bool isAdmin, int orderId);
    Task<ApiResponse<List<OrderGetDto>>> GetShopOrdersAsync(int userId, OrderStatus? status);
    Task<ApiResponse<List<OrderGetDto>>> GetAllAsync(OrderStatus? status);
    Task<ApiResponse<string>> UpdateStatusAsync(int userId, bool isAdmin, int orderId, UpdateOrderStatusDto dto);
    Task<ApiResponse<string>> CancelAsync(int userId, int orderId, string? reason);
}