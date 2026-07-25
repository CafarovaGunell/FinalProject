// Models/Adoption/PetImage.cs
using ViViPaw.Models.Base;

namespace ViViPaw.Models.Adoption;

public class PetImage : BaseEntity
{
    public int PetId { get; set; }
    public Pet Pet { get; set; } = null!;

    public string ImageUrl { get; set; } = string.Empty;
    public bool IsMain { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;
}