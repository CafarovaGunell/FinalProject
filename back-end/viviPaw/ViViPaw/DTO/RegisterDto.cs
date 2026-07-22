using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTO
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Ad və Soyad boş ola bilməz.")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "E-poçt ünvanı boş ola bilməz.")]
        [EmailAddress(ErrorMessage = "Düzgün e-poçt formatı daxil edin.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Parol boş ola bilməz.")]
        [MinLength(6, ErrorMessage = "Parol ən azı 6 simvol olmalıdır.")]
        public string Password { get; set; } = string.Empty;
    }
}