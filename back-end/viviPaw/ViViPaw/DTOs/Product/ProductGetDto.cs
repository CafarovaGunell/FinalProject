// DTOs/Product/ProductGetDto.cs
namespace ViViPaw.DTOs.Product;

public class ProductGetDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public decimal FinalPrice { get; set; }
    public int StockQuantity { get; set; }
    public bool InStock { get; set; }
    public string? MainImageUrl { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? TargetAnimalName { get; set; }
    public string? Brand { get; set; }
    public string? PetShopName { get; set; }
    public int PetShopId { get; set; }
    public double? AverageRating { get; set; }
    public int ReviewCount { get; set; }
}