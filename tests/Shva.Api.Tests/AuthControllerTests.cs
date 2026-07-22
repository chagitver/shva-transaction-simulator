using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shva.Api.Contracts;
using Shva.Api.Controllers;
using Shva.Api.Data;
using Shva.Api.Models;

namespace Shva.Api.Tests;

public sealed class AuthControllerTests
{
    [Fact]
    public async Task RegisterReturnsConflictCodeWhenEmailAlreadyExists()
    {
        await using var db = CreateDb();
        db.Users.Add(new AppUser
        {
            Id = Guid.NewGuid(),
            DisplayName = "Existing User",
            Email = "existing@example.com",
            NormalizedEmail = "EXISTING@EXAMPLE.COM",
            PasswordHash = "not-used-in-this-test",
            CreatedAtUtc = DateTimeOffset.UtcNow
        });
        await db.SaveChangesAsync();
        var controller = new AuthController(db, new PasswordHasher<AppUser>());

        var response = await controller.Register(
            new RegisterRequest
            {
                DisplayName = "Another User",
                Email = " Existing@Example.com ",
                Password = "Password123!"
            },
            CancellationToken.None);

        var conflict = Assert.IsType<ObjectResult>(response.Result);
        Assert.Equal(409, conflict.StatusCode);
        var problem = Assert.IsType<ProblemDetails>(conflict.Value);
        Assert.Equal("duplicate_email", problem.Extensions["code"]);
    }

    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }
}
