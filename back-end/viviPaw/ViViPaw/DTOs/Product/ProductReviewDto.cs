
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Product;

public class ProductReviewCreateDto
{
    [Required]
    public int ProductId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [Required, MaxLength(1000)]
    public string Comment { get; set; } = string.Empty;
}

public class ProductReviewGetDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int AppUserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public string? UserImageUrl { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string DateText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}