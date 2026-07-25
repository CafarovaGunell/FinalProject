
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.DTOs.Common;
using ViViPaw.DTOs.User;
using ViViPaw.Models.Common;
using ViViPaw.Models.Identity;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Services;

public class UserProfileService : IUserProfileService
{
    private readonly AppDbContext _db;
    private readonly UserManager<AppUser> _userManager;
    private readonly IMapper _mapper;

    public UserProfileService(AppDbContext db, UserManager<AppUser> userManager, IMapper mapper)
    {
        _db = db;
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<ApiResponse<UserGetDto>> GetMyProfileAsync(int userId)
    {
        var user = await _db.Users.Include(x => x.SocialMediaLinks)
            .FirstOrDefaultAsync(x => x.Id == userId);
        if (user is null) return ApiResponse<UserGetDto>.Fail("İstifadəçi tapılmadı.");

        var dto = _mapper.Map<UserGetDto>(user);
        dto.Roles = (await _userManager.GetRolesAsync(user)).ToList();

        return ApiResponse<UserGetDto>.Ok(dto);
    }

    public async Task<ApiResponse<UserGetDto>> UpdateAsync(int userId, UpdateProfileDto dto)
    {
        var user = await _db.Users.Include(x => x.SocialMediaLinks)
            .FirstOrDefaultAsync(x => x.Id == userId);
        if (user is null) return ApiResponse<UserGetDto>.Fail("İstifadəçi tapılmadı.");

        user.FullName = dto.FullName;
        user.PhoneNumber = dto.PhoneNumber;
        user.City = dto.City;
        user.ImageUrl = dto.ImageUrl;

        _db.SocialMediaLinks.RemoveRange(user.SocialMediaLinks);
        foreach (var s in dto.SocialMediaLinks.Where(x => !string.IsNullOrWhiteSpace(x.ProfileUrlOrUsername)))
        {
            _db.SocialMediaLinks.Add(new SocialMediaLink
            {
                AppUserId = userId,
                PlatformName = s.PlatformName,
                ProfileUrlOrUsername = s.ProfileUrlOrUsername
            });
        }

        await _db.SaveChangesAsync();

        var result = _mapper.Map<UserGetDto>(
            await _db.Users.Include(x => x.SocialMediaLinks).FirstAsync(x => x.Id == userId));
        result.Roles = (await _userManager.GetRolesAsync(user)).ToList();

        return ApiResponse<UserGetDto>.Ok(result, "Profil yeniləndi.");
    }

    public async Task<ApiResponse<List<UserGetDto>>> GetAllAsync(string? role, string? search)
    {
        var q = _db.Users.Include(x => x.SocialMediaLinks).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            q = q.Where(x => x.FullName.ToLower().Contains(s) || x.Email!.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            var roleId = await _db.Roles.Where(r => r.Name == role).Select(r => r.Id).FirstOrDefaultAsync();
            var userIds = await _db.UserRoles.Where(ur => ur.RoleId == roleId).Select(ur => ur.UserId).ToListAsync();
            q = q.Where(x => userIds.Contains(x.Id));
        }

        var users = await q.OrderByDescending(x => x.CreatedAt).Take(500).ToListAsync();

        var list = new List<UserGetDto>();
        foreach (var u in users)
        {
            var dto = _mapper.Map<UserGetDto>(u);
            dto.Roles = (await _userManager.GetRolesAsync(u)).ToList();
            list.Add(dto);
        }

        return ApiResponse<List<UserGetDto>>.Ok(list);
    }

    public async Task<ApiResponse<string>> SetActiveAsync(int userId, bool isActive)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == userId);
        if (user is null) return ApiResponse<string>.Fail("İstifadəçi tapılmadı.");

        if (await _userManager.IsInRoleAsync(user, Roles.SuperAdmin))
            return ApiResponse<string>.Fail("SuperAdmin hesabı bloklana bilməz.");

        user.IsActive = isActive;
        await _db.SaveChangesAsync();

        return ApiResponse<string>.Ok("ok", isActive ? "Hesab aktivləşdirildi." : "Hesab bloklandı.");
    }
}