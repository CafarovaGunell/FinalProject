// DTOs/Testimonial/TestimonialCreateDto.cs
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Testimonial;

public class TestimonialCreateDto
{
    [Required, MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;

    public string? PetImageUrl { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; } = 5;
}