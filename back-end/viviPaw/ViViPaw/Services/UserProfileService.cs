
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
        // 1) Rol adını ID-yə çevir (DbSet ilə — navigation adından asılı deyil)
        var roleId = 0;
        if (!string.IsNullOrWhiteSpace(role))
        {
            roleId = await _db.Roles
                .Where(r => r.Name == role)
                .Select(r => r.Id)
                .FirstOrDefaultAsync();

            if (roleId == 0)
                return ApiResponse<List<UserGetDto>>.Ok(new List<UserGetDto>());
        }

        // 2) Əsas sorğu
        var q = _db.Users.AsQueryable();

        if (roleId != 0)
            q = q.Where(u => _db.UserRoles.Any(ur => ur.UserId == u.Id && ur.RoleId == roleId));

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            q = q.Where(u =>
                (u.FullName != null && u.FullName.ToLower().Contains(s)) ||
                (u.Email != null && u.Email.ToLower().Contains(s)) ||
                (u.UserName != null && u.UserName.ToLower().Contains(s)));
        }

        var users = await q.OrderBy(u => u.Id).ToListAsync();

        // 3) Rolları ayrıca doldur (mapping-də Ignore olunduğu üçün)
        var userIds = users.Select(u => u.Id).ToList();

        var roleMap = await (
            from ur in _db.UserRoles
            join r in _db.Roles on ur.RoleId equals r.Id
            where userIds.Contains(ur.UserId)
            select new { ur.UserId, RoleName = r.Name! }
        )
        .GroupBy(x => x.UserId)
        .ToDictionaryAsync(g => g.Key, g => g.Select(x => x.RoleName).ToList());

        var dtos = users.Select(u =>
        {
            var dto = _mapper.Map<UserGetDto>(u);
            dto.Roles = roleMap.TryGetValue(u.Id, out var rs) ? rs : new List<string>();
            return dto;
        }).ToList();

        return ApiResponse<List<UserGetDto>>.Ok(dtos);
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