using System.ComponentModel.DataAnnotations;
using ViViPaw.Models.Base;
using ViViPaw.Models.Common;
using ViViPaw.Models.Identity;

namespace ViViPaw.Models.Chat;

public class ChatMessage : BaseEntity
{
    public int ConversationId { get; set; }
    public ChatConversation Conversation { get; set; } = null!;

    public int SenderUserId { get; set; }
    public AppUser SenderUser { get; set; } = null!;

    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? AttachmentUrl { get; set; }

    [MaxLength(50)]
    public string? AttachmentType { get; set; }

    public bool IsDeletedForEveryone { get; set; } = false;
    public ICollection<ChatMessageDeletion> DeletedForUsers { get; set; } = new List<ChatMessageDeletion>();
}


