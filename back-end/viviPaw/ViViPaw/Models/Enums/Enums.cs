
namespace ViViPaw.Models.Enums;

public enum Gender { Male = 1, Female = 2 }

public enum PetSize { Small = 1, Medium = 2, Large = 3 }

/// <summary>Heyvanı kim yerləşdirib</summary>
public enum PetOwnerType { PetShop = 1, User = 2 }

public enum AdoptionStatus { Available = 1, Pending = 2, Adopted = 3, Inactive = 4 }

public enum RequestStatus { Pending = 1, Approved = 2, Rejected = 3, Cancelled = 4 }

public enum AppointmentStatus { Pending = 1, Confirmed = 2, Completed = 3, Cancelled = 4, NoShow = 5 }

public enum OrderStatus { Pending = 1, Confirmed = 2, Preparing = 3, Shipped = 4, Delivered = 5, Cancelled = 6 }

/// <summary>PetShop / Baytar hesabının admin təsdiqi</summary>
public enum ApprovalStatus { Pending = 1, Approved = 2, Rejected = 3 }

/// <summary>Bir Category cədvəli — 3 fərqli məqsəd üçün</summary>
public enum CategoryType { Pet = 1, Product = 2, Article = 3 }

public enum NotificationType
{
    AdoptionRequestReceived = 1,
    AdoptionRequestAnswered = 2,
    AppointmentCreated = 3,
    AppointmentStatusChanged = 4,
    OrderStatusChanged = 5,
    AccountApproved = 6,
    System = 7
}