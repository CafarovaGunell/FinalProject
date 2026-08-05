
using ViViPaw.Models.Enums;

namespace ViViPaw.DTOs.Pet;

public class PetFilterDto
{
    public string? Search { get; set; }          // ad, cins, şəhər
    public int? CategoryId { get; set; }
    public string? City { get; set; }
    public Gender? Gender { get; set; }
    public PetSize? Size { get; set; }
    public AdoptionStatus? AdoptionStatus { get; set; }
    public PetOwnerType? OwnerType { get; set; }
    public bool? IsVaccinated { get; set; }
    public bool? IsNeutered { get; set; }
    public bool? IsUrgent { get; set; }
    public int? MinAgeInMonths { get; set; }
    public int? MaxAgeInMonths { get; set; }

    public string SortBy { get; set; } = "newest"; // newest | oldest | age_asc | age_desc
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}