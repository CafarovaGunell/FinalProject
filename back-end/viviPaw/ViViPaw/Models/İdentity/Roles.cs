// Models/Identity/Roles.cs
namespace ViViPaw.Models.Identity;

/// <summary>Magic string işlətməmək üçün: [Authorize(Roles = Roles.Admin)]</summary>
public static class Roles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Admin = "Admin";
    public const string Customer = "Customer";
    public const string PetShop = "PetShop";
    public const string Veterinarian = "Veterinarian";

    public static readonly string[] All = { SuperAdmin, Admin, Customer, PetShop, Veterinarian };
    public const string AdminOrSuper = SuperAdmin + "," + Admin;
}