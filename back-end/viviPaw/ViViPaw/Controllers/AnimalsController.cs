using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ViViPaw.DTO;

namespace ViViPaw.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class AnimalsController : ControllerBase
    {
        [HttpGet]

        public ActionResult Get()
        {
            var data = new[]
    {
        new {
            Id = 1,
            Name = "name1",
            Breed = "Golden Retriever",
            Gender = "Erkək",
            AgeInMonths = 3,
            ImageUrl = "https://images.unsplash.com/photo-1552053831-71594a27632d",
            Location = "Bakı",
            Type = "İt",
            IsUrgent = true
        },
        new {
            Id = 2,
            Name = "name2",
            Breed = "Siam",
            Gender = "Dişi",
            AgeInMonths = 12,
            ImageUrl = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
            Location = "Sumqayıt",
            Type = "Pişik",
            IsUrgent = false
        }
    };

            return Ok(data);
        }
    }
}
