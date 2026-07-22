using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shva.Api.Contracts;
using Shva.Api.Controllers;
using Shva.Api.Data;
using Shva.Api.Services;

namespace Shva.Api.Tests;

public sealed class TransactionsControllerTests
{
    [Fact]
    public async Task StoresRejectedTransactionButDoesNotReturnItFromApprovedEndpoint()
    {
        await using var db = CreateDb();
        var controller = CreateController(db);

        var result = await controller.Simulate(
            new SimulateTransactionRequest("FR", DateTimeOffset.Parse("2026-07-15T20:00:00Z")),
            CancellationToken.None);

        var created = Assert.IsType<CreatedResult>(result.Result);
        var transaction = Assert.IsType<TransactionResponse>(created.Value);
        Assert.Equal("Rejected", transaction.Status);
        Assert.Single(db.Transactions);

        var approvedResult = await controller.GetApproved(CancellationToken.None);
        var ok = Assert.IsType<OkObjectResult>(approvedResult.Result);
        Assert.Empty(Assert.IsAssignableFrom<IEnumerable<TransactionResponse>>(ok.Value));
    }

    [Fact]
    public async Task ReturnsApprovedTransactionsNewestFirst()
    {
        await using var db = CreateDb();
        var controller = CreateController(db);
        await controller.Simulate(new("FR", DateTimeOffset.Parse("2026-07-15T07:00:00Z")), CancellationToken.None);
        await controller.Simulate(new("JP", DateTimeOffset.Parse("2026-07-15T03:00:00Z")), CancellationToken.None);

        var result = await controller.GetApproved(CancellationToken.None);
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var transactions = Assert.IsAssignableFrom<IEnumerable<TransactionResponse>>(ok.Value).ToList();

        Assert.Equal(2, transactions.Count);
        Assert.Equal("JP", transactions[0].RegionCode);
        Assert.All(transactions, transaction => Assert.Equal("Approved", transaction.Status));
    }

    [Fact]
    public async Task ApprovedEndpointReturnsOnlyTheCurrentUsersTransactions()
    {
        await using var db = CreateDb();
        var firstUser = CreateController(db, "fe8c14c2-73bd-4665-b10f-909c45ee230d");
        var secondUser = CreateController(db, "17d8c3fd-fe92-41cd-9126-f106bc3de5db");
        await firstUser.Simulate(new("FR", DateTimeOffset.Parse("2026-07-15T07:00:00Z")), CancellationToken.None);
        await secondUser.Simulate(new("JP", DateTimeOffset.Parse("2026-07-15T03:00:00Z")), CancellationToken.None);

        var result = await firstUser.GetApproved(CancellationToken.None);
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var transactions = Assert.IsAssignableFrom<IEnumerable<TransactionResponse>>(ok.Value).ToList();

        Assert.Single(transactions);
        Assert.Equal("FR", transactions[0].RegionCode);
    }

    private static AppDbContext CreateDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static TransactionsController CreateController(
        AppDbContext db,
        string userId = "fe8c14c2-73bd-4665-b10f-909c45ee230d")
    {
        var regions = new RegionCatalog();
        var controller = new TransactionsController(db, regions, new TransactionApprovalService());
        var identity = new ClaimsIdentity(
            [new Claim(ClaimTypes.NameIdentifier, userId)],
            "Test");
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
        };
        return controller;
    }
}
