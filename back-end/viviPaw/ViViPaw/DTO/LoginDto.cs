using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTO
{
    public class LoginDto
    {
        [Required(ErrorMessage = "E-poçt ünvanı boş ola bilməz.")]
        [EmailAddress(ErrorMessage = "Düzgün e-poçt formatı daxil edin.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Parol boş ola bilməz.")]
        public string Password { get; set; } = string.Empty;
    }
}