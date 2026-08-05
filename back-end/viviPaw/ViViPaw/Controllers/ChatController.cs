using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTOs.Chat;
using ViViPaw.Helpers;
using ViViPaw.Services.Interfaces;

namespace ViViPaw.Controllers;

[ApiController]
[Route("api/chat")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chat;

    public ChatController(IChatService chat)
    {
        _chat = chat;
    }

  
    [HttpGet("conversations")]
    public async Task<IActionResult> Conversations()
    {
        var r = await _chat.GetMyConversationsAsync(User.GetUserId());
        return r.Success ? Ok(r) : BadRequest(r);
    }

    


    [HttpPost("start")]
    public async Task<IActionResult> Start([FromBody] StartChatDto dto)
    {
        var r = await _chat.StartConversationAsync(User.GetUserId(), dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

   


    [HttpGet("conversations/{conversationId:int}/messages")]
    public async Task<IActionResult> Messages(
        int conversationId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var r = await _chat.GetMessagesAsync(User.GetUserId(), conversationId, page, pageSize);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    



    [HttpPost("conversations/{conversationId:int}/messages")]
    public async Task<IActionResult> Send(int conversationId, [FromBody] SendMessageDto dto)
    {
        var r = await _chat.SendMessageAsync(User.GetUserId(), conversationId, dto);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    



    [HttpPut("conversations/{conversationId:int}/read")]
    public async Task<IActionResult> Read(int conversationId)
    {
        var r = await _chat.MarkAsReadAsync(User.GetUserId(), conversationId);
        return r.Success ? Ok(r) : BadRequest(r);
    }


    [HttpDelete("conversations/{conversationId:int}")]
    public async Task<IActionResult> DeleteConversation(int conversationId)
    {
        var r = await _chat.DeleteConversationAsync(User.GetUserId(), conversationId);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpDelete("messages/{messageId:int}/me")]
    public async Task<IActionResult> DeleteMessageForMe(int messageId)
    {
        var r = await _chat.DeleteMessageForMeAsync(User.GetUserId(), messageId);
        return r.Success ? Ok(r) : BadRequest(r);
    }

    [HttpDelete("messages/{messageId:int}/everyone")]
    public async Task<IActionResult> DeleteMessageForEveryone(int messageId)
    {
        var r = await _chat.DeleteMessageForEveryoneAsync(User.GetUserId(), messageId);
        return r.Success ? Ok(r) : BadRequest(r);
    }
}


