
namespace ViViPaw.DTOs.Admin;

public class DashboardDto
{
    // İstifadəçilər
    public int TotalUsers { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalPetShops { get; set; }
    public int TotalVets { get; set; }

    // Təsdiq gözləyənlər
    public int PendingShops { get; set; }
    public int PendingVets { get; set; }
    public int PendingPets { get; set; }
    public int PendingTestimonials { get; set; }

    // Heyvanlar
    public int TotalPets { get; set; }
    public int AvailablePets { get; set; }
    public int AdoptedPets { get; set; }
    public int TotalAdoptionRequests { get; set; }

    // E-ticarət
    public int TotalProducts { get; set; }
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public decimal TotalRevenue { get; set; }

    // Baytar
    public int TotalAppointments { get; set; }
    public int UpcomingAppointments { get; set; }

    // Məzmun
    public int TotalArticles { get; set; }

    public List<MonthlyStatDto> MonthlyOrders { get; set; } = new();
    public List<MonthlyStatDto> MonthlyAdoptions { get; set; } = new();
}

public class MonthlyStatDto
{
    public string Month { get; set; } = string.Empty;  // "2026-07"
    public int Count { get; set; }
    public decimal Total { get; set; }
}