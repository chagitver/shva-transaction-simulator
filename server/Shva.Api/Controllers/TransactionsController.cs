using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shva.Api.Contracts;
using Shva.Api.Data;
using Shva.Api.Models;
using Shva.Api.Services;

namespace Shva.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/transactions")]
public sealed class TransactionsController(
    AppDbContext db,
    IRegionCatalog regions,
    ITransactionApprovalService approvalService) : ControllerBase
{
    [HttpPost("simulate")]
    [ProducesResponseType<TransactionResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<TransactionResponse>> Simulate(
        SimulateTransactionRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        if (!regions.TryGet(request.RegionCode, out var region))
        {
            ModelState.AddModelError(nameof(request.RegionCode), "The selected region is not supported.");
        }

        if (request.SubmittedAtUtc == default)
        {
            ModelState.AddModelError(nameof(request.SubmittedAtUtc), "A valid ISO-8601 timestamp is required.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var result = approvalService.Evaluate(request.SubmittedAtUtc, region!);
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            RegionCode = region!.Code,
            TimeZoneId = region.TimeZoneId,
            SubmittedAtUtc = request.SubmittedAtUtc.ToUniversalTime(),
            LocalDateTime = result.LocalDateTime,
            Status = result.IsApproved ? TransactionStatus.Approved : TransactionStatus.Rejected,
            CreatedAtUtc = DateTimeOffset.UtcNow,
            UserId = userId
        };

        db.Transactions.Add(transaction);
        await db.SaveChangesAsync(cancellationToken);
        var response = ToResponse(transaction, region);
        return Created($"/api/transactions/{transaction.Id}", response);
    }

    [HttpGet("approved")]
    [ProducesResponseType<IReadOnlyCollection<TransactionResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<TransactionResponse>>> GetApproved(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();

        var approved = await db.Transactions
            .AsNoTracking()
            .Where(transaction => transaction.UserId == userId && transaction.Status == TransactionStatus.Approved)
            .OrderByDescending(transaction => transaction.CreatedAtUtc)
            .Take(50)
            .ToListAsync(cancellationToken);

        return Ok(approved.Select(transaction =>
        {
            regions.TryGet(transaction.RegionCode, out var region);
            return ToResponse(transaction, region!);
        }));
    }

    private static TransactionResponse ToResponse(Transaction transaction, RegionDefinition region) =>
        new(
            transaction.Id,
            transaction.RegionCode,
            region.Name,
            transaction.TimeZoneId,
            transaction.SubmittedAtUtc,
            transaction.LocalDateTime,
            transaction.LocalDateTime.ToString("HH:mm"),
            transaction.Status.ToString());

    private bool TryGetUserId(out Guid userId) =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
}
