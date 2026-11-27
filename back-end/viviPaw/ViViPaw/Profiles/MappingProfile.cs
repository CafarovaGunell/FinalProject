
using AutoMapper;
using ViViPaw.DTOs.Adoption;
using ViViPaw.DTOs.Article;
using ViViPaw.DTOs.Cart;
using ViViPaw.DTOs.Category;
using ViViPaw.DTOs.Notification;
using ViViPaw.DTOs.Order;
using ViViPaw.DTOs.Pet;
using ViViPaw.DTOs.PetShop;
using ViViPaw.DTOs.Product;
using ViViPaw.DTOs.Testimonial;
using ViViPaw.DTOs.User;
using ViViPaw.DTOs.Vet;
using ViViPaw.DTOs.WishList;
using ViViPaw.Helpers;
using ViViPaw.Models.Adoption;
using ViViPaw.Models.Common;
using ViViPaw.Models.Enums;
using ViViPaw.Models.Identity;
using ViViPaw.Models.Shop;
using ViViPaw.Models.Vet;

namespace ViViPaw.Profiles;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // -------- Category --------
        CreateMap<Category, CategoryGetDto>()
            .ForMember(d => d.TypeName, o => o.MapFrom(s => s.Type.ToString()))
            .ForMember(d => d.ParentCategoryName, o => o.MapFrom(s => s.ParentCategory != null ? s.ParentCategory.Name : null));
        CreateMap<CategoryCreateDto, Category>();

        

        // -------- Pet --------
        CreateMap<Pet, PetGetDto>()
            .ForMember(d => d.GenderText, o => o.MapFrom(s => FormatHelpers.GenderText(s.Gender)))
            .ForMember(d => d.AgeText, o => o.MapFrom(s => FormatHelpers.FormatAge(s.AgeInMonths)))
            .ForMember(d => d.MainImageUrl, o => o.MapFrom(s => s.Images
                .OrderByDescending(i => i.IsMain).ThenBy(i => i.DisplayOrder)
                .Select(i => i.ImageUrl).FirstOrDefault()))
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : ""))
            .ForMember(d => d.AdoptionStatusText, o => o.MapFrom(s => FormatHelpers.AdoptionStatusText(s.AdoptionStatus)))
            .ForMember(d => d.DateText, o => o.MapFrom(s => FormatHelpers.FormatDate(s.CreatedAt)));

        CreateMap<Pet, PetDetailDto>()
            .ForMember(d => d.GenderText, o => o.MapFrom(s => FormatHelpers.GenderText(s.Gender)))
            .ForMember(d => d.AgeText, o => o.MapFrom(s => FormatHelpers.FormatAge(s.AgeInMonths)))
            .ForMember(d => d.SizeText, o => o.MapFrom(s => FormatHelpers.SizeText(s.Size)))
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : ""))
            .ForMember(d => d.AdoptionStatusText, o => o.MapFrom(s => FormatHelpers.AdoptionStatusText(s.AdoptionStatus)))
            .ForMember(d => d.DateText, o => o.MapFrom(s => FormatHelpers.FormatDate(s.CreatedAt)))
            .ForMember(d => d.ImageUrls, o => o.MapFrom(s => s.Images
                .OrderByDescending(i => i.IsMain).ThenBy(i => i.DisplayOrder)
                .Select(i => i.ImageUrl).ToList()))
            .ForMember(d => d.PetShopName, o => o.MapFrom(s => s.PetShop != null ? s.PetShop.Name : null))
            .ForMember(d => d.PetShopLogo, o => o.MapFrom(s => s.PetShop != null ? s.PetShop.LogoUrl : null))
            .ForMember(d => d.PetShopPhone, o => o.MapFrom(s => s.PetShop != null ? s.PetShop.Phone : null))
            .ForMember(d => d.PetShopEmail, o => o.MapFrom(s => s.PetShop != null ? s.PetShop.Email : null))
            .ForMember(d => d.PetShopInstagram, o => o.MapFrom(s => s.PetShop != null ? s.PetShop.Instagram : null))
            .ForMember(d => d.PetShopAddress, o => o.MapFrom(s => s.PetShop != null ? s.PetShop.Address : null))
            .ForMember(d => d.Latitude, o => o.MapFrom(s => s.PetShop != null ? s.PetShop.Latitude : null))
            .ForMember(d => d.Longitude, o => o.MapFrom(s => s.PetShop != null ? s.PetShop.Longitude : null))
            .ForMember(d => d.OwnerUserId, o => o.MapFrom(s => s.AppUserId))
            .ForMember(d => d.OwnerFullName, o => o.MapFrom(s => s.AppUser != null ? s.AppUser.FullName : null));

        CreateMap<PetCreateDto, Pet>()
            .ForMember(d => d.Images, o => o.Ignore())
            .ForMember(d => d.PetShopId, o => o.Ignore())
            .ForMember(d => d.AppUserId, o => o.Ignore())
            .ForMember(d => d.OwnerType, o => o.Ignore());

        CreateMap<PetUpdateDto, Pet>()
            .ForMember(d => d.Images, o => o.Ignore())
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

        // -------- Adoption --------
        CreateMap<AdoptionRequest, AdoptionRequestGetDto>()
            .ForMember(d => d.PetName, o => o.MapFrom(s => s.Pet != null ? s.Pet.Name : ""))
            .ForMember(d => d.PetImageUrl, o => o.MapFrom(s => s.Pet != null
                ? s.Pet.Images.OrderByDescending(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()
                : null))
            .ForMember(d => d.ApplicantFullName, o => o.MapFrom(s => s.ApplicantUser != null ? s.ApplicantUser.FullName : ""))
            .ForMember(d => d.StatusText, o => o.MapFrom(s => FormatHelpers.RequestStatusText(s.Status)))
            .ForMember(d => d.DateText, o => o.MapFrom(s => FormatHelpers.FormatDate(s.CreatedAt)));

        CreateMap<AdoptionRequestCreateDto, AdoptionRequest>()
            .ForMember(d => d.ApplicantUserId, o => o.Ignore())
            .ForMember(d => d.Status, o => o.Ignore());

        // -------- WishList --------
        CreateMap<WishList, WishListPetDto>()
            .ForMember(d => d.WishListId, o => o.MapFrom(s => s.Id))
            .ForMember(d => d.PetId, o => o.MapFrom(s => s.PetId))
            .ForMember(d => d.Name, o => o.MapFrom(s => s.Pet.Name))
            .ForMember(d => d.Breed, o => o.MapFrom(s => s.Pet.Breed))
            .ForMember(d => d.GenderText, o => o.MapFrom(s => FormatHelpers.GenderText(s.Pet.Gender)))
            .ForMember(d => d.AgeText, o => o.MapFrom(s => FormatHelpers.FormatAge(s.Pet.AgeInMonths)))
            .ForMember(d => d.MainImageUrl, o => o.MapFrom(s => s.Pet.Images
                .OrderByDescending(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()))
            .ForMember(d => d.City, o => o.MapFrom(s => s.Pet.City))
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Pet.Category != null ? s.Pet.Category.Name : null))
            .ForMember(d => d.AdoptionStatus, o => o.MapFrom(s => s.Pet.AdoptionStatus))
            .ForMember(d => d.AdoptionStatusText, o => o.MapFrom(s => FormatHelpers.AdoptionStatusText(s.Pet.AdoptionStatus)));

        // -------- PetShop --------
        CreateMap<PetShop, PetShopGetDto>()
            .ForMember(d => d.ApprovalStatusText, o => o.MapFrom(s => FormatHelpers.ApprovalStatusText(s.ApprovalStatus)))
            .ForMember(d => d.ProductCount, o => o.MapFrom(s => s.Products.Count(p => !p.IsDeleted)))
            .ForMember(d => d.PetCount, o => o.MapFrom(s => s.Pets.Count(p => !p.IsDeleted)));

        CreateMap<PetShop, PetShopDetailDto>()
            .ForMember(d => d.ApprovalStatusText, o => o.MapFrom(s => FormatHelpers.ApprovalStatusText(s.ApprovalStatus)));

        CreateMap<PetShopCreateDto, PetShop>();
        CreateMap<PetShopUpdateDto, PetShop>();

   
        CreateMap<ProductImage, ProductImageDto>();

        // -------- Product --------
        CreateMap<Product, ProductGetDto>()
            .ForMember(d => d.FinalPrice, o => o.MapFrom(s => s.DiscountPrice ?? s.Price))
            .ForMember(d => d.InStock, o => o.MapFrom(s => s.StockQuantity > 0))
            .ForMember(d => d.MainImageUrl, o => o.MapFrom(s => s.Images
                .OrderByDescending(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()))
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : ""))
            .ForMember(d => d.TargetAnimalName, o => o.MapFrom(s => s.TargetAnimalCategory != null ? s.TargetAnimalCategory.Name : null))
            .ForMember(d => d.PetShopName, o => o.MapFrom(s => s.PetShop != null ? s.PetShop.Name : ""))
            .ForMember(d => d.AverageRating, o => o.MapFrom(s => s.Reviews.Any() ? s.Reviews.Average(r => r.Rating) : (double?)null))
            .ForMember(d => d.ReviewCount, o => o.MapFrom(s => s.Reviews.Count));

        CreateMap<Product, ProductDetailDto>()
            .ForMember(d => d.FinalPrice, o => o.MapFrom(s => s.DiscountPrice ?? s.Price))
            .ForMember(d => d.InStock, o => o.MapFrom(s => s.StockQuantity > 0))
            .ForMember(d => d.ImageUrls, o => o.MapFrom(s => s.Images
                .OrderByDescending(i => i.IsMain).Select(i => i.ImageUrl).ToList()))
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : ""))
            .ForMember(d => d.TargetAnimalName, o => o.MapFrom(s => s.TargetAnimalCategory != null ? s.TargetAnimalCategory.Name : null))
            .ForMember(d => d.PetShopName, o => o.MapFrom(s => s.PetShop != null ? s.PetShop.Name : ""))
            .ForMember(d => d.PetShopLogo, o => o.MapFrom(s => s.PetShop != null ? s.PetShop.LogoUrl : null))
            .ForMember(d => d.PetShopPhone, o => o.MapFrom(s => s.PetShop != null ? s.PetShop.Phone : null))
            .ForMember(d => d.AverageRating, o => o.MapFrom(s => s.Reviews.Any() ? s.Reviews.Average(r => r.Rating) : (double?)null))
            .ForMember(d => d.ReviewCount, o => o.MapFrom(s => s.Reviews.Count));

        CreateMap<ProductCreateDto, Product>()
            .ForMember(d => d.Images, o => o.Ignore())
            .ForMember(d => d.PetShopId, o => o.Ignore());
        CreateMap<ProductUpdateDto, Product>()
            .ForMember(d => d.Images, o => o.Ignore());

        // -------- Cart --------
        CreateMap<Cart, CartDto>()
            .ForMember(d => d.TotalItems, o => o.MapFrom(s => s.Items.Sum(i => i.Quantity)))
            .ForMember(d => d.SubTotal, o => o.MapFrom(s => s.Items.Sum(i =>
                (i.Product.DiscountPrice ?? i.Product.Price) * i.Quantity)));

        CreateMap<CartItem, CartItemDto>()
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product.Name))
            .ForMember(d => d.ProductImageUrl, o => o.MapFrom(s => s.Product.Images
                .OrderByDescending(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()))
            .ForMember(d => d.UnitPrice, o => o.MapFrom(s => s.Product.DiscountPrice ?? s.Product.Price))
            .ForMember(d => d.LineTotal, o => o.MapFrom(s => (s.Product.DiscountPrice ?? s.Product.Price) * s.Quantity))
            .ForMember(d => d.StockQuantity, o => o.MapFrom(s => s.Product.StockQuantity))
            .ForMember(d => d.PetShopName, o => o.MapFrom(s => s.Product.PetShop != null ? s.Product.PetShop.Name : ""));

        // -------- Order --------
        CreateMap<Order, OrderGetDto>()
            .ForMember(d => d.StatusText, o => o.MapFrom(s => FormatHelpers.OrderStatusText(s.Status)))
            .ForMember(d => d.DateText, o => o.MapFrom(s => FormatHelpers.FormatDate(s.CreatedAt)));

        CreateMap<OrderItem, OrderItemDto>()
            .ForMember(d => d.LineTotal, o => o.MapFrom(s => s.UnitPrice * s.Quantity))
            .ForMember(d => d.PetShopName, o => o.MapFrom(s => s.PetShop != null ? s.PetShop.Name : ""));

        // -------- Vet --------
        CreateMap<VeterinarianProfile, VetProfileGetDto>()
            .ForMember(d => d.ApprovalStatusText, o => o.MapFrom(s => FormatHelpers.ApprovalStatusText(s.ApprovalStatus)))
            .ForMember(d => d.VeterinarianFullName, o => o.MapFrom(s => s.AppUser != null ? s.AppUser.FullName : ""));

        CreateMap<VetProfileCreateDto, VeterinarianProfile>();
        CreateMap<VetProfileUpdateDto, VeterinarianProfile>();

        CreateMap<VetService, VetServiceGetDto>();
        CreateMap<VetServiceCreateDto, VetService>();

        CreateMap<VetSchedule, VetScheduleGetDto>()
            .ForMember(d => d.DayName, o => o.MapFrom(s => FormatHelpers.DayName(s.DayOfWeek)))
            .ForMember(d => d.StartTime, o => o.MapFrom(s => s.StartTime.ToString("HH:mm")))
            .ForMember(d => d.EndTime, o => o.MapFrom(s => s.EndTime.ToString("HH:mm")))
            .ForMember(d => d.BreakStart, o => o.MapFrom(s => s.BreakStart.HasValue ? s.BreakStart.Value.ToString("HH:mm") : null))
            .ForMember(d => d.BreakEnd, o => o.MapFrom(s => s.BreakEnd.HasValue ? s.BreakEnd.Value.ToString("HH:mm") : null));
        CreateMap<VetScheduleCreateDto, VetSchedule>();

        CreateMap<VetTimeOff, VetTimeOffGetDto>();
        CreateMap<VetTimeOffCreateDto, VetTimeOff>();

        CreateMap<VetAppointment, AppointmentGetDto>()
            .ForMember(d => d.ClinicName, o => o.MapFrom(s => s.VeterinarianProfile != null ? s.VeterinarianProfile.ClinicName : ""))
            .ForMember(d => d.VeterinarianName, o => o.MapFrom(s => s.VeterinarianProfile != null && s.VeterinarianProfile.AppUser != null
                ? s.VeterinarianProfile.AppUser.FullName : ""))
            .ForMember(d => d.ServiceName, o => o.MapFrom(s => s.VetService != null ? s.VetService.Name : ""))
            .ForMember(d => d.Price, o => o.MapFrom(s => s.PriceSnapshot))
            .ForMember(d => d.PetName, o => o.MapFrom(s => s.Pet != null ? s.Pet.Name : null))
            .ForMember(d => d.TimeText, o => o.MapFrom(s => $"{s.StartTime:dd.MM.yyyy HH:mm} - {s.EndTime:HH:mm}"))
            .ForMember(d => d.StatusText, o => o.MapFrom(s => FormatHelpers.AppointmentStatusText(s.Status)))
            .ForMember(d => d.CustomerFullName, o => o.MapFrom(s => s.CustomerUser != null ? s.CustomerUser.FullName : ""));

        CreateMap<AppointmentCreateDto, VetAppointment>()
            .ForMember(d => d.CustomerUserId, o => o.Ignore())
            .ForMember(d => d.EndTime, o => o.Ignore())
            .ForMember(d => d.PriceSnapshot, o => o.Ignore())
            .ForMember(d => d.Status, o => o.Ignore());

        // -------- Article --------
        CreateMap<PetCareArticle, ArticleGetDto>()
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category != null ? s.Category.Name : ""))
            .ForMember(d => d.AuthorName, o => o.MapFrom(s => s.VeterinarianProfile != null && s.VeterinarianProfile.AppUser != null
                ? s.VeterinarianProfile.AppUser.FullName : ""))
            .ForMember(d => d.AuthorClinic, o => o.MapFrom(s => s.VeterinarianProfile != null ? s.VeterinarianProfile.ClinicName : null))
            .ForMember(d => d.DateText, o => o.MapFrom(s => FormatHelpers.FormatDate(s.CreatedAt)));
        CreateMap<ArticleCreateDto, PetCareArticle>()
            .ForMember(d => d.Slug, o => o.Ignore())
            .ForMember(d => d.VeterinarianProfileId, o => o.Ignore());

        // -------- Testimonial --------
        CreateMap<Testimonial, TestimonialGetDto>()
            .ForMember(d => d.UserFullName, o => o.MapFrom(s => s.AppUser != null ? s.AppUser.FullName : ""))
            .ForMember(d => d.UserImageUrl, o => o.MapFrom(s => s.AppUser != null ? s.AppUser.ImageUrl : null))
            .ForMember(d => d.LikesCount, o => o.MapFrom(s => s.Likes.Count))
            .ForMember(d => d.DateText, o => o.MapFrom(s => FormatHelpers.FormatDate(s.CreatedAt)));
        // IsLikedByCurrentUser → service-də set olunacaq
        CreateMap<TestimonialCreateDto, Testimonial>();

        // -------- Notification --------
        CreateMap<Notification, NotificationGetDto>()
            .ForMember(d => d.DateText, o => o.MapFrom(s => FormatHelpers.FormatDate(s.CreatedAt)));


        // -------- ProductReview --------
        CreateMap<ProductReview, ProductReviewGetDto>()
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product != null ? s.Product.Name : ""))
            .ForMember(d => d.UserFullName, o => o.MapFrom(s => s.AppUser != null ? s.AppUser.FullName : ""))
            .ForMember(d => d.UserImageUrl, o => o.MapFrom(s => s.AppUser != null ? s.AppUser.ImageUrl : null))
            .ForMember(d => d.DateText, o => o.MapFrom(s => FormatHelpers.FormatDate(s.CreatedAt)));




        // -------- Article update --------
        CreateMap<ArticleUpdateDto, PetCareArticle>()
            .ForMember(d => d.Slug, o => o.Ignore())
            .ForMember(d => d.VeterinarianProfileId, o => o.Ignore());

        // -------- UserGetDto: sosial media --------
        CreateMap<AppUser, UserGetDto>()
            .ForMember(d => d.Roles, o => o.Ignore())
            .ForMember(d => d.SocialMediaLinks, o => o.MapFrom(s => s.SocialMediaLinks));



    }
}