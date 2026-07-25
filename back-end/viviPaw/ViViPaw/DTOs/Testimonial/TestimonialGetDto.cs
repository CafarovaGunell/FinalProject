// DTOs/Testimonial/TestimonialGetDto.cs
namespace ViViPaw.DTOs.Testimonial;

public class TestimonialGetDto
{
    public int Id { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public string? UserImageUrl { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string? PetImageUrl { get; set; }
    public int Rating { get; set; }
    public int LikesCount { get; set; }
    public bool IsLikedByCurrentUser { get; set; }
    public string DateText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}