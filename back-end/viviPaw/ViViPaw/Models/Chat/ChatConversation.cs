using System.ComponentModel.DataAnnotations;
using ViViPaw.Models.Base;
using ViViPaw.Models.Common;
using ViViPaw.Models.Enums;

namespace ViViPaw.Models.Chat;

public class ChatConversation : BaseEntity
{
    public ChatType Type { get; set; } = ChatType.Direct;

    [MaxLength(200)]
    public string? Title { get; set; }

    // Kontekst ID-ləri
    public int? PetId { get; set; }
    public int? ProductId { get; set; }
    public int? OrderId { get; set; }
    public int? AppointmentId { get; set; }

    [MaxLength(300)]
    public string? LastMessage { get; set; }

    public DateTime? LastMessageAt { get; set; }

    public bool IsClosed { get; set; } = false;

    public ICollection<ChatParticipant> Participants { get; set; } = new List<ChatParticipant>();
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}



