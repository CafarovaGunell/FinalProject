
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Category;

public class CategoryGetDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconUrl { get; set; }
    public CategoryType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int? ParentCategoryId { get; set; }
    public string? ParentCategoryName { get; set; }
}