namespace ViViPaw.Helpers
{
    public class FormatHelpers
    {
        public static string FormatAge(int ageInMonths)
        {
            if (ageInMonths < 12)
                return $"{ageInMonths} aylıq";

            int years = ageInMonths / 12;
            int months = ageInMonths % 12;

            if (months == 0)
                return $"{years} yaş";

            return $"{years} yaş {months} ay";
        }

        public static string FormatDate(DateTime createdAt)
        {
            var date = createdAt.Date;
            var today = DateTime.Now.Date;

            if (date == today)
                return "Bugün";
            if (date == today.AddDays(-1))
                return "Dünən";

            return date.ToString("dd.MM.yyyy");
        }
    }
}
