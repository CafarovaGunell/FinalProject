// DTOs/WishList/WishListPetDto.cs
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.WishList;

public class WishListPetDto
{
    public int WishListId { get; set; }
    public int PetId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Breed { get; set; } = string.Empty;
    public string GenderText { get; set; } = string.Empty;
    public string AgeText { get; set; } = string.Empty;
    public string? MainImageUrl { get; set; }
    public string City { get; set; } = string.Empty;
    public string? CategoryName { get; set; }
    public AdoptionStatus AdoptionStatus { get; set; }
    public string AdoptionStatusText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}