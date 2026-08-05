using ViViPaw.Models.Base;
using ViViPaw.Models.Common;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Chat;

public class ChatParticipant : BaseEntity
{
    public int ConversationId { get; set; }
    public ChatConversation Conversation { get; set; } = null!;

    public int UserId { get; set; }
    public AppUser User { get; set; } = null!;

    public DateTime? LastReadAt { get; set; }

    public bool IsArchived { get; set; } = false;
    public bool IsMuted { get; set; } = false;

    public DateTime? ClearedAt { get; set; }
}


