
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Auth;

public class RegisterDto
{
    [Required(ErrorMessage = "Ad və soyad boş ola bilməz.")]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-poçt boş ola bilməz.")]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Parol boş ola bilməz.")]
    [MinLength(6, ErrorMessage = "Parol ən azı 6 simvol olmalıdır.")]
    public string Password { get; set; } = string.Empty;

    [Phone]
    public string? PhoneNumber { get; set; }

    public string? City { get; set; }

    
    //Customer | PetShop | Veterinarian
    // Admin/SuperAdmin 

    [Required]
    public string Role { get; set; } = "Customer";
}