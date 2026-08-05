
using ViViPaw.Models.Base;
using ViViPaw.Models.Common;

namespace ViViPaw.Models.Shop;

public class Product : BaseEntity
{
    public int PetShopId { get; set; }                 
    public PetShop PetShop { get; set; } = null!;

    public int CategoryId { get; set; }                 // Yem, Oyuncaq, Aksesuar (Type = Product)
    public Category Category { get; set; } = null!;

    //Hansı heyvan üçün — Category (Type = Pet): İt, Pişik
    public int? TargetAnimalCategoryId { get; set; }
    public Category? TargetAnimalCategory { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int StockQuantity { get; set; }
    public string? Brand { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
}