// DTOs/Product/ProductFilterDto.cs
namespace ViViPaw.DTOs.Product;

public class ProductFilterDto
{
    public string? Search { get; set; }
    public int? CategoryId { get; set; }
    public int? TargetAnimalCategoryId { get; set; }
    public int? PetShopId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? InStockOnly { get; set; }
    public string SortBy { get; set; } = "newest"; // newest | price_asc | price_desc | rating
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}