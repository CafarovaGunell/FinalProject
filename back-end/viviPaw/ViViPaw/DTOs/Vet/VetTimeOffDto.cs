
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Vet;

public class VetTimeOffCreateDto
{
    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public string? Reason { get; set; }
}

public class VetTimeOffGetDto
{
    public int Id { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Reason { get; set; }
}