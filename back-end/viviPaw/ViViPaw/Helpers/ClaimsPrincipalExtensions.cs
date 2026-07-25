// Helpers/ClaimsPrincipalExtensions.cs
using System.Security.Claims;

namespace ViViPaw.Helpers;

public static class ClaimsPrincipalExtensions
{
    /// <summary>Cari istifadəçinin Id-si. Tapılmasa -1.</summary>
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(id, out var result) ? result : -1;
    }

    public static string? GetEmail(this ClaimsPrincipal user)
        => user.FindFirstValue(ClaimTypes.Email);

    public static string? GetFullName(this ClaimsPrincipal user)
        => user.FindFirstValue("fullName");

    public static List<string> GetRoles(this ClaimsPrincipal user)
        => user.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

    public static bool IsInAnyRole(this ClaimsPrincipal user, params string[] roles)
        => roles.Any(user.IsInRole);
}