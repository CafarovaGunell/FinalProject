using Microsoft.EntityFrameworkCore;
using ViViPaw.Models;

namespace ViViPaw.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<Pet> Pets { get; set; }
        public DbSet<PetShop> PetShops { get; set; }
        public DbSet<Category> Categories { get; set; }

        public AppDbContext(DbContextOptions options) : base(options)
        {
        }
      
    }
}
