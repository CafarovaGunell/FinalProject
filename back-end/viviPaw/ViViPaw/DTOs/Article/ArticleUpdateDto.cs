
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Article;

public class ArticleUpdateDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string ShortDescription { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    [Required]
    public int CategoryId { get; set; }

    public bool IsPublished { get; set; }
}