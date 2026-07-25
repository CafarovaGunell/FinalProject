// Data/AppDbContext.cs
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using ViViPaw.Models.Adoption;
using ViViPaw.Models.Base;
using ViViPaw.Models.Common;
using ViViPaw.Models.Identity;
using ViViPaw.Models.Shop;
using ViViPaw.Models.Vet;

namespace ViViPaw.Data;

public class AppDbContext : IdentityDbContext<AppUser, AppRole, int>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<SocialMediaLink> SocialMediaLinks => Set<SocialMediaLink>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<TestimonialLike> TestimonialLikes => Set<TestimonialLike>();
    public DbSet<PetCareArticle> PetCareArticles => Set<PetCareArticle>();
    public DbSet<Notification> Notifications => Set<Notification>();

    public DbSet<Pet> Pets => Set<Pet>();
    public DbSet<PetImage> PetImages => Set<PetImage>();
    public DbSet<AdoptionRequest> AdoptionRequests => Set<AdoptionRequest>();
    public DbSet<WishList> WishLists => Set<WishList>();

    public DbSet<VeterinarianProfile> VeterinarianProfiles => Set<VeterinarianProfile>();
    public DbSet<VetService> VetServices => Set<VetService>();
    public DbSet<VetSchedule> VetSchedules => Set<VetSchedule>();
    public DbSet<VetTimeOff> VetTimeOffs => Set<VetTimeOff>();
    public DbSet<VetAppointment> VetAppointments => Set<VetAppointment>();

    public DbSet<PetShop> PetShops => Set<PetShop>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
    public DbSet<FavoriteProduct> FavoriteProducts => Set<FavoriteProduct>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // Identity cədvəl adları
        b.Entity<AppUser>().ToTable("Users");
        b.Entity<AppRole>().ToTable("Roles");

        // decimal(18,2)
        foreach (var property in b.Model.GetEntityTypes()
                     .SelectMany(t => t.GetProperties())
                     .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetPrecision(18);
            property.SetScale(2);
        }

        // =========================
        // 1-1 PROFİLLƏR
        // =========================
        b.Entity<PetShop>()
            .HasOne(x => x.AppUser).WithOne()
            .HasForeignKey<PetShop>(x => x.AppUserId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<VeterinarianProfile>()
            .HasOne(x => x.AppUser).WithOne()
            .HasForeignKey<VeterinarianProfile>(x => x.AppUserId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<Cart>()
            .HasOne(x => x.AppUser).WithOne()
            .HasForeignKey<Cart>(x => x.AppUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // =========================
        // PET / ADOPTION
        // =========================
        b.Entity<Pet>(e =>
        {
            e.HasOne(x => x.PetShop).WithMany(x => x.Pets)
                .HasForeignKey(x => x.PetShopId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.AppUser).WithMany()
                .HasForeignKey(x => x.AppUserId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Category).WithMany()
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(x => new { x.AdoptionStatus, x.CategoryId, x.City });
        });

        b.Entity<PetImage>()
            .HasOne(x => x.Pet).WithMany(x => x.Images)
            .HasForeignKey(x => x.PetId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<AdoptionRequest>(e =>
        {
            e.HasOne(x => x.Pet).WithMany(x => x.AdoptionRequests)
                .HasForeignKey(x => x.PetId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.ApplicantUser).WithMany()
                .HasForeignKey(x => x.ApplicantUserId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(x => new { x.PetId, x.ApplicantUserId }).IsUnique();
        });

        // ★ WishList: heç bir tərəfdə Cascade yoxdur (conflict olmasın)
        b.Entity<WishList>(e =>
        {
            e.HasOne(x => x.Pet).WithMany(x => x.WishLists)
                .HasForeignKey(x => x.PetId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.AppUser).WithMany()
                .HasForeignKey(x => x.AppUserId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(x => new { x.AppUserId, x.PetId }).IsUnique();
        });

        // =========================
        // VET
        // =========================
        b.Entity<VetService>()
            .HasOne(x => x.VeterinarianProfile).WithMany(x => x.Services)
            .HasForeignKey(x => x.VeterinarianProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<VetSchedule>()
            .HasOne(x => x.VeterinarianProfile).WithMany(x => x.Schedules)
            .HasForeignKey(x => x.VeterinarianProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<VetTimeOff>()
            .HasOne(x => x.VeterinarianProfile).WithMany(x => x.TimeOffs)
            .HasForeignKey(x => x.VeterinarianProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<VetAppointment>(e =>
        {
            e.HasOne(x => x.VeterinarianProfile).WithMany(x => x.Appointments)
                .HasForeignKey(x => x.VeterinarianProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.CustomerUser).WithMany()
                .HasForeignKey(x => x.CustomerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.VetService).WithMany()
                .HasForeignKey(x => x.VetServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Pet).WithMany()
                .HasForeignKey(x => x.PetId)
                .OnDelete(DeleteBehavior.NoAction); // SetNull bəzən problem çıxarır

            e.HasIndex(x => new { x.VeterinarianProfileId, x.StartTime });
        });

        b.Entity<PetCareArticle>()
            .HasOne(x => x.VeterinarianProfile).WithMany(x => x.Articles)
            .HasForeignKey(x => x.VeterinarianProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<PetCareArticle>()
            .HasOne(x => x.Category).WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // =========================
        // SHOP
        // =========================
        b.Entity<Product>(e =>
        {
            e.HasOne(x => x.PetShop).WithMany(x => x.Products)
                .HasForeignKey(x => x.PetShopId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Category).WithMany()
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.TargetAnimalCategory).WithMany()
                .HasForeignKey(x => x.TargetAnimalCategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<ProductImage>()
            .HasOne(x => x.Product).WithMany(x => x.Images)
            .HasForeignKey(x => x.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<ProductReview>(e =>
        {
            e.HasOne(x => x.Product).WithMany(x => x.Reviews)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.AppUser).WithMany()
                .HasForeignKey(x => x.AppUserId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(x => new { x.AppUserId, x.ProductId }).IsUnique();
        });

        b.Entity<CartItem>(e =>
        {
            e.HasOne(x => x.Cart).WithMany(x => x.Items)
                .HasForeignKey(x => x.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Product).WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(x => new { x.CartId, x.ProductId }).IsUnique();
        });

        b.Entity<Order>(e =>
        {
            e.HasIndex(x => x.OrderNumber).IsUnique();

            e.HasOne(x => x.CustomerUser).WithMany()
                .HasForeignKey(x => x.CustomerUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<OrderItem>(e =>
        {
            e.HasOne(x => x.Order).WithMany(x => x.Items)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Product).WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.PetShop).WithMany()
                .HasForeignKey(x => x.PetShopId)
                .OnDelete(DeleteBehavior.Restrict);

            e.Ignore(x => x.LineTotal);
        });

        // ★ FavoriteProduct: Cascade yox
        b.Entity<FavoriteProduct>(e =>
        {
            e.HasOne(x => x.AppUser).WithMany()
                .HasForeignKey(x => x.AppUserId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Product).WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(x => new { x.AppUserId, x.ProductId }).IsUnique();
        });

        // =========================
        // COMMON
        // =========================
        b.Entity<RefreshToken>()
            .HasOne(x => x.AppUser).WithMany(x => x.RefreshTokens)
            .HasForeignKey(x => x.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<SocialMediaLink>()
            .HasOne(x => x.AppUser).WithMany(x => x.SocialMediaLinks)
            .HasForeignKey(x => x.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<Notification>()
            .HasOne(x => x.AppUser).WithMany()
            .HasForeignKey(x => x.AppUserId)
            .OnDelete(DeleteBehavior.Cascade);

        b.Entity<Testimonial>()
            .HasOne(x => x.AppUser).WithMany()
            .HasForeignKey(x => x.AppUserId)
            .OnDelete(DeleteBehavior.Restrict);

        b.Entity<TestimonialLike>(e =>
        {
            e.HasOne(x => x.Testimonial).WithMany(x => x.Likes)
                .HasForeignKey(x => x.TestimonialId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.AppUser).WithMany()
                .HasForeignKey(x => x.AppUserId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(x => new { x.AppUserId, x.TestimonialId }).IsUnique();
        });

        b.Entity<PetShop>()
            .HasIndex(x => x.TaxNumber)
            .IsUnique();

        b.Entity<Category>()
            .HasOne(x => x.ParentCategory).WithMany(x => x.SubCategories)
            .HasForeignKey(x => x.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Soft-delete filter
        // =========================
        // GLOBAL SOFT-DELETE FİLTRİ
        // =========================
        b.Entity<Pet>().HasQueryFilter(x => !x.IsDeleted);
        b.Entity<Product>().HasQueryFilter(x => !x.IsDeleted);
        b.Entity<PetShop>().HasQueryFilter(x => !x.IsDeleted);
        b.Entity<VeterinarianProfile>().HasQueryFilter(x => !x.IsDeleted);
        b.Entity<PetCareArticle>().HasQueryFilter(x => !x.IsDeleted);
        b.Entity<Category>().HasQueryFilter(x => !x.IsDeleted);
        b.Entity<Order>().HasQueryFilter(x => !x.IsDeleted);

        // ---- Filtri olan entity-lərə bağlı uşaqlara da eyni filtr ----
        b.Entity<PetImage>().HasQueryFilter(x => !x.IsDeleted && !x.Pet.IsDeleted);
        b.Entity<AdoptionRequest>().HasQueryFilter(x => !x.IsDeleted && !x.Pet.IsDeleted);
        b.Entity<WishList>().HasQueryFilter(x => !x.IsDeleted && !x.Pet.IsDeleted);

        b.Entity<ProductImage>().HasQueryFilter(x => !x.IsDeleted && !x.Product.IsDeleted);
        b.Entity<ProductReview>().HasQueryFilter(x => !x.IsDeleted && !x.Product.IsDeleted);
        b.Entity<CartItem>().HasQueryFilter(x => !x.IsDeleted && !x.Product.IsDeleted);
        b.Entity<FavoriteProduct>().HasQueryFilter(x => !x.IsDeleted && !x.Product.IsDeleted);

        b.Entity<OrderItem>().HasQueryFilter(x => !x.IsDeleted && !x.Order.IsDeleted);

        b.Entity<VetService>().HasQueryFilter(x => !x.IsDeleted && !x.VeterinarianProfile.IsDeleted);
        b.Entity<VetSchedule>().HasQueryFilter(x => !x.IsDeleted && !x.VeterinarianProfile.IsDeleted);
        b.Entity<VetTimeOff>().HasQueryFilter(x => !x.IsDeleted && !x.VeterinarianProfile.IsDeleted);
        b.Entity<VetAppointment>().HasQueryFilter(x => !x.IsDeleted && !x.VeterinarianProfile.IsDeleted);
    }


    // CreatedAt / UpdatedAt avtomatik
    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added) entry.Entity.CreatedAt = DateTime.UtcNow;
            if (entry.State == EntityState.Modified) entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(ct);
    }

   
}