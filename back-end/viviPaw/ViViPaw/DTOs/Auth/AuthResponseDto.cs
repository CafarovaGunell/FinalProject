// DTOs/Auth/AuthResponseDto.cs
namespace ViViPaw.DTOs.Auth;

public class AuthResponseDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public List<string> Roles { get; set; } = new();
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }

    // Frontend yönləndirmə üçün (varsa)
    public int? PetShopId { get; set; }
    public int? VeterinarianProfileId { get; set; }
    public string? ApprovalStatus { get; set; } // Pending/Approved/Rejected
}