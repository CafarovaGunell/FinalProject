
using ViViPaw.Models.Enums;

namespace ViViPaw.Helpers;

public static class FormatHelpers
{
    public static string FormatAge(int months)
    {
        if (months < 1) return "Yeni doğulmuş";
        if (months < 12) return $"{months} aylıq";
        var years = months / 12;
        var rem = months % 12;
        return rem == 0 ? $"{years} yaş" : $"{years} yaş {rem} ay";
    }

    public static string FormatDate(DateTime date)
    {
        var az = date.ToLocalTime(); // lazım olsa
        var diff = DateTime.UtcNow - date;
        if (diff.TotalMinutes < 1) return "İndicə";
        if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes} dəqiqə əvvəl";
        if (diff.TotalHours < 24) return $"{(int)diff.TotalHours} saat əvvəl";
        if (diff.TotalDays < 7) return $"{(int)diff.TotalDays} gün əvvəl";
        return date.ToString("dd.MM.yyyy");
    }

    public static string GenderText(Gender g) => g switch
    {
        Gender.Male => "Erkək",
        Gender.Female => "Dişi",
        _ => "Naməlum"
    };

    public static string SizeText(PetSize s) => s switch
    {
        PetSize.Small => "Kiçik",
        PetSize.Medium => "Orta",
        PetSize.Large => "Böyük",
        _ => "Naməlum"
    };

    public static string AdoptionStatusText(AdoptionStatus s) => s switch
    {
        AdoptionStatus.Available => "Sahiblənməyə hazır",
        AdoptionStatus.Pending => "Müraciət gözlənilir",
        AdoptionStatus.Adopted => "Sahibləndirilib",
        AdoptionStatus.Inactive => "Deaktiv",
        _ => s.ToString()
    };

    public static string RequestStatusText(RequestStatus s) => s switch
    {
        RequestStatus.Pending => "Gözləmədə",
        RequestStatus.Approved => "Təsdiqləndi",
        RequestStatus.Rejected => "Rədd edildi",
        RequestStatus.Cancelled => "Ləğv edildi",
        _ => s.ToString()
    };

    public static string AppointmentStatusText(AppointmentStatus s) => s switch
    {
        AppointmentStatus.Pending => "Gözləmədə",
        AppointmentStatus.Confirmed => "Təsdiqləndi",
        AppointmentStatus.Completed => "Tamamlandı",
        AppointmentStatus.Cancelled => "Ləğv edildi",
        AppointmentStatus.NoShow => "Gəlmədi",
        _ => s.ToString()
    };

    public static string OrderStatusText(OrderStatus s) => s switch
    {
        OrderStatus.Pending => "Gözləmədə",
        OrderStatus.Confirmed => "Təsdiqləndi",
        OrderStatus.Preparing => "Hazırlanır",
        OrderStatus.Shipped => "Göndərildi",
        OrderStatus.Delivered => "Çatdırıldı",
        OrderStatus.Cancelled => "Ləğv edildi",
        _ => s.ToString()
    };

    public static string ApprovalStatusText(ApprovalStatus s) => s switch
    {
        ApprovalStatus.Pending => "Təsdiq gözləyir",
        ApprovalStatus.Approved => "Təsdiqlənib",
        ApprovalStatus.Rejected => "Rədd edilib",
        _ => s.ToString()
    };

    public static string DayName(DayOfWeek d) => d switch
    {
        DayOfWeek.Monday => "Bazar ertəsi",
        DayOfWeek.Tuesday => "Çərşənbə axşamı",
        DayOfWeek.Wednesday => "Çərşənbə",
        DayOfWeek.Thursday => "Cümə axşamı",
        DayOfWeek.Friday => "Cümə",
        DayOfWeek.Saturday => "Şənbə",
        DayOfWeek.Sunday => "Bazar",
        _ => d.ToString()
    };


    public static string Slugify(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return Guid.NewGuid().ToString("N")[..8];

        var map = new Dictionary<char, string>
        {
            ['ə'] = "e",
            ['Ə'] = "e",
            ['ı'] = "i",
            ['İ'] = "i",
            ['ğ'] = "g",
            ['Ğ'] = "g",
            ['ü'] = "u",
            ['Ü'] = "u",
            ['ş'] = "s",
            ['Ş'] = "s",
            ['ö'] = "o",
            ['Ö'] = "o",
            ['ç'] = "c",
            ['Ç'] = "c"
        };

        var sb = new System.Text.StringBuilder();
        foreach (var ch in text.ToLowerInvariant())
        {
            if (map.TryGetValue(ch, out var rep)) sb.Append(rep);
            else if (char.IsLetterOrDigit(ch)) sb.Append(ch);
            else if (ch is ' ' or '-' or '_') sb.Append('-');
        }

        var slug = sb.ToString();
        while (slug.Contains("--")) slug = slug.Replace("--", "-");
        slug = slug.Trim('-');

        return string.IsNullOrEmpty(slug) ? Guid.NewGuid().ToString("N")[..8] : slug;
    }
}