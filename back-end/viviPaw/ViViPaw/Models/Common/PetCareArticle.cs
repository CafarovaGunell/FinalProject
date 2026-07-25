// Models/Common/PetCareArticle.cs
using ViViPaw.Models.Base;
using ViViPaw.Models.Vet;

namespace ViViPaw.Models.Common;

public class PetCareArticle : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsPublished { get; set; } = false;
    public int ViewCount { get; set; } = 0;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public int VeterinarianProfileId { get; set; }
    public VeterinarianProfile VeterinarianProfile { get; set; } = null!;
}