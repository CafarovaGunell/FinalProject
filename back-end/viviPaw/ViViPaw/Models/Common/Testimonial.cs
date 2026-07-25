// Models/Common/Testimonial.cs
using ViViPaw.Models.Base;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Common;

public class Testimonial : BaseEntity
{
    public int AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;

    public string Comment { get; set; } = string.Empty;
    public string? PetImageUrl { get; set; }
    public int Rating { get; set; } = 5;          // 1..5
    public bool IsApproved { get; set; } = false; // Admin moderasiyası

    public ICollection<TestimonialLike> Likes { get; set; } = new List<TestimonialLike>();
    // LikesCount sahəsi SİLİNDİ → Likes.Count istifadə olunur (sinxrondan çıxmasın)
}