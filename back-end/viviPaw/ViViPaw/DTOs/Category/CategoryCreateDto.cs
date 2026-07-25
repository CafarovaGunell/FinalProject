// DTOs/Category/CategoryCreateDto.cs
using System.ComponentModel.DataAnnotations;
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Category;

public class CategoryCreateDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
    public string? IconUrl { get; set; }

    [Required]
    public CategoryType Type { get; set; }

    public int? ParentCategoryId { get; set; }
}