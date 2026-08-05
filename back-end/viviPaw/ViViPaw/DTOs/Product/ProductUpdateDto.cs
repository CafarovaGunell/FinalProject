
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Product;

public class ProductUpdateDto
{
    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(3000)]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, 100000)]
    public decimal Price { get; set; }

    public decimal? DiscountPrice { get; set; }

    [Range(0, 100000)]
    public int StockQuantity { get; set; }

    public string? Brand { get; set; }
    public bool IsActive { get; set; } = true;

    [Required]
    public int CategoryId { get; set; }

    public int? TargetAnimalCategoryId { get; set; }
    public List<string>? ImageUrls { get; set; }
}