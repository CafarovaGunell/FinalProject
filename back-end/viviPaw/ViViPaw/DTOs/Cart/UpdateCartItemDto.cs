
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Cart;

public class UpdateCartItemDto
{
    [Range(1, 100)]
    public int Quantity { get; set; }
}