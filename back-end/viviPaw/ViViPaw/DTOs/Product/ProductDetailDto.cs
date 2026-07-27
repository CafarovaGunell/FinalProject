// DTOs/Product/ProductDetailDto.cs
namespace ViViPaw.DTOs.Product;

public class ProductDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public decimal FinalPrice { get; set; }
    public int StockQuantity { get; set; }
    public bool InStock { get; set; }
    public string? Brand { get; set; }
    public bool IsActive { get; set; }

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int? TargetAnimalCategoryId { get; set; }
    public string? TargetAnimalName { get; set; }

    public List<string> ImageUrls { get; set; } = new();

    public int PetShopId { get; set; }
    public string PetShopName { get; set; } = string.Empty;
    public string? PetShopLogo { get; set; }
    public string? PetShopPhone { get; set; }

    public double? AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public DateTime CreatedAt { get; set; }

    public string? MainImageUrl { get; set; }

    public List<ProductImageDto> Images { get; set; } = new();
}