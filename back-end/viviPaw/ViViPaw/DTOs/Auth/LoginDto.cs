
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Auth;

public class LoginDto
{
    [Required(ErrorMessage = "E-poçt boş ola bilməz.")]
    [EmailAddress(ErrorMessage = "Düzgün e-poçt daxil edin.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Parol boş ola bilməz.")]
    public string Password { get; set; } = string.Empty;
}