// Models/Identity/AppRole.cs
using Microsoft.AspNetCore.Identity;

namespace ViViPaw.Models.Identity;

public class AppRole : IdentityRole<int>
{
    public string? Description { get; set; }
}