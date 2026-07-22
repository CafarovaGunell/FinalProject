using AutoMapper;
using ViViPaw.DTO;
using ViViPaw.Helpers;
using ViViPaw.Models;

namespace ViViPaw.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Pet -> PetGetDto
            CreateMap<Pet, PetGetDto>()
                .ForMember(dest => dest.AgeText, opt => opt.MapFrom(src => FormatHelpers.FormatAge(src.AgeInMonths)))
                .ForMember(dest => dest.DateText, opt => opt.MapFrom(src => FormatHelpers.FormatDate(src.CreatedAt)))
                .ForMember(dest => dest.IsUrgent, opt => opt.MapFrom(src => src.AgeInMonths <= 1))
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : "Naməlum"));

            // Pet -> PetDetailDto (Tam Təmiz Versiya)
            CreateMap<Pet, PetDetailDto>()
                .ForMember(dest => dest.AgeText, opt => opt.MapFrom(src => FormatHelpers.FormatAge(src.AgeInMonths)))
                .ForMember(dest => dest.DateText, opt => opt.MapFrom(src => FormatHelpers.FormatDate(src.CreatedAt)))
                .ForMember(dest => dest.IsUrgent, opt => opt.MapFrom(src => src.AgeInMonths <= 1))
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : "Naməlum"))
                .ForMember(dest => dest.PetShopName, opt => opt.MapFrom(src => src.PetShop != null ? src.PetShop.Name : "Şəxsi elan"));
        }
    }
}