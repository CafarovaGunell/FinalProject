// Models/Common/Category.cs
using ViViPaw.Models.Base;
using ViViPaw.Models.Enums;

namespace ViViPaw.Models.Common;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public CategoryType Type { get; set; }          // Pet / Product / Article
    public bool IsActive { get; set; } = true;

    public int? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();
}