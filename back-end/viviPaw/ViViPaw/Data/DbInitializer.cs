// Data/DbInitializer.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Models.Common;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;

namespace ViViPaw.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration config)
    {
        var db = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        var roleManager = services.GetRequiredService<RoleManager<AppRole>>();

        await db.Database.MigrateAsync();

        // ---- 1. Rollar ----
        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new AppRole { Name = role, Description = role });
        }

        // ---- 2. SuperAdmin ----
        var email = config["SeedAdmin:Email"]!;
        var password = config["SeedAdmin:Password"]!;
        var fullName = config["SeedAdmin:FullName"]!;

        if (await userManager.FindByEmailAsync(email) is null)
        {
            var admin = new AppUser
            {
                UserName = email,
                Email = email,
                FullName = fullName,
                EmailConfirmed = true,
                IsActive = true
            };
            var result = await userManager.CreateAsync(admin, password);
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, Roles.SuperAdmin);
        }

        // ---- 3. Kateqoriyalar ----
        if (!await db.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                // Heyvan növləri
                new() { Name = "İt",      Type = CategoryType.Pet },
                new() { Name = "Pişik",   Type = CategoryType.Pet },
                new() { Name = "Quş",     Type = CategoryType.Pet },
                new() { Name = "Balıq",   Type = CategoryType.Pet },
                new() { Name = "Gəmirici",Type = CategoryType.Pet },
                new() { Name = "Digər",   Type = CategoryType.Pet },

                // Məhsul kateqoriyaları
                new() { Name = "Yem",       Type = CategoryType.Product },
                new() { Name = "Oyuncaq",   Type = CategoryType.Product },
                new() { Name = "Aksesuar",  Type = CategoryType.Product },
                new() { Name = "Geyim",     Type = CategoryType.Product },
                new() { Name = "Gigiyena",  Type = CategoryType.Product },
                new() { Name = "Yataq/Qəfəs", Type = CategoryType.Product },

                // Məqalə kateqoriyaları
                new() { Name = "Qidalanma",  Type = CategoryType.Article },
                new() { Name = "Sağlamlıq",  Type = CategoryType.Article },
                new() { Name = "Təlim",      Type = CategoryType.Article },
                new() { Name = "Baxım",      Type = CategoryType.Article }
            };

            db.Categories.AddRange(categories);
            await db.SaveChangesAsync();
        }
    }
}