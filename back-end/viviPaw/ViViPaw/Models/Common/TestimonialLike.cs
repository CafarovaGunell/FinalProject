// Models/Common/TestimonialLike.cs
using ViViPaw.Models.Base;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Common;

public class TestimonialLike : BaseEntity
{
    public int AppUserId { get; set; }
    public AppUser AppUser { get; set; } = null!;

    public int TestimonialId { get; set; }
    public Testimonial Testimonial { get; set; } = null!;
}