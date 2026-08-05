using ViViPaw.DTOs.Chat;
using ViViPaw.DTOs.Common;

namespace ViViPaw.Services.Interfaces;

public interface IChatService
{
    Task<ApiResponse<List<ChatConversationGetDto>>> GetMyConversationsAsync(int userId);

    Task<ApiResponse<List<ChatMessageGetDto>>> GetMessagesAsync(
        int userId,
        int conversationId,
        int page = 1,
        int pageSize = 50);

    Task<ApiResponse<ChatConversationGetDto>> StartConversationAsync(
        int userId,
        StartChatDto dto);

    Task<ApiResponse<ChatMessageGetDto>> SendMessageAsync(
        int userId,
        int conversationId,
        SendMessageDto dto);

    Task<ApiResponse<bool>> MarkAsReadAsync(int userId, int conversationId);
    Task<ApiResponse<bool>> DeleteConversationAsync(int userId, int conversationId);

    Task<ApiResponse<bool>> DeleteMessageForMeAsync(int userId, int messageId);

    Task<ApiResponse<bool>> DeleteMessageForEveryoneAsync(int userId, int messageId);
}


