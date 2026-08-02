using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Admin;

public class SetRoleDto
{
    [Required(ErrorMessage = "Rol seçilməlidir")]
    public string Role { get; set; } = null!;
}