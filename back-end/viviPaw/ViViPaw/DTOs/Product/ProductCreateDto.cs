// DTOs/Product/ProductCreateDto.cs
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Product;

public class ProductCreateDto
{
    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(3000)]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, 100000)]
    public decimal Price { get; set; }

    [Range(0, 100000)]
    public decimal? DiscountPrice { get; set; }

    [Range(0, 100000)]
    public int StockQuantity { get; set; }

    public string? Brand { get; set; }

    [Required]
    public int CategoryId { get; set; }              // Product category

    public int? TargetAnimalCategoryId { get; set; } // Pet category (İt/Pişik)

    public List<string> ImageUrls { get; set; } = new();
}
// PetShopId YOXDUR → JWT-dən gəlir