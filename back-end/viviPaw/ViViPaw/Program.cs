using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ViViPaw.Data;
using ViViPaw.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// AutoMapper-i layihəyə qeydiyyatdan keçiririk
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default"));
});

// 1. TokenService-i Dependency Injection üçün qeydiyyatdan keçiririk
builder.Services.AddScoped<TokenService>();

// 2. JWT Authentication konfiqurasiyası
var secretKey = builder.Configuration["JwtSettings:SecretKey"]
    ?? "ViViPaw_Super_Secret_Key_2026_Must_Be_Long_Enough_To_Satisfy_HmacSha512_Validation!";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

builder.Services.AddSwaggerGen();

// CORS Konfiqurasiyası
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ----------------------------------------------------
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// 3. MÜTLƏQ BURA DİQQƏT: Authentication həmişə Authorization-dan əvvəl gəlməlidir!
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();