using ViViPaw.Models.Base;
using ViViPaw.Models.Common;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Chat;

public class ChatMessageDeletion : BaseEntity
{
    public int MessageId { get; set; }
    public ChatMessage Message { get; set; } = null!;

    public int UserId { get; set; }
    public AppUser User { get; set; } = null!;
}



