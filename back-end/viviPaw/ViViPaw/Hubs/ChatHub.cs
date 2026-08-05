using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ViViPaw.Data;
using ViViPaw.Helpers;

namespace ViViPaw.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly AppDbContext _db;

    public ChatHub(AppDbContext db)
    {
        _db = db;
    }

    public async Task JoinConversation(int conversationId)
    {
        if (Context.User == null) return;

        var userId = Context.User.GetUserId();

        var allowed = await _db.ChatParticipants
            .AnyAsync(x => x.ConversationId == conversationId && x.UserId == userId);

        if (!allowed) return;

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(conversationId));
    }

    public async Task LeaveConversation(int conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(conversationId));
    }

    public static string GroupName(int conversationId)
        => $"chat:{conversationId}";
}



