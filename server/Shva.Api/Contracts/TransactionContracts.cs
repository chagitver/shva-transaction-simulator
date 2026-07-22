using System.ComponentModel.DataAnnotations;

namespace Shva.Api.Contracts;

public sealed record LocalizedName(string En, string He);

public sealed record RegionResponse(string Code, LocalizedName Name, string TimeZoneId);

public sealed record SimulateTransactionRequest(
    [Required, StringLength(8)] string RegionCode,
    DateTimeOffset SubmittedAtUtc);

public sealed record TransactionResponse(
    Guid Id,
    string RegionCode,
    LocalizedName RegionName,
    string TimeZoneId,
    DateTimeOffset SubmittedAtUtc,
    DateTimeOffset LocalDateTime,
    string LocalTime,
    string Status);
