// DTOs/Cart/AddToCartDto.cs
using System.ComponentModel.DataAnnotations;

namespace ViViPaw.DTOs.Cart;

public class AddToCartDto
{
    [Required]
    public int ProductId { get; set; }

    [Range(1, 100)]
    public int Quantity { get; set; } = 1;
}