namespace Shva.Api.Services;

public sealed record ApprovalResult(DateTimeOffset LocalDateTime, bool IsApproved);

public interface ITransactionApprovalService
{
    ApprovalResult Evaluate(DateTimeOffset submittedAtUtc, RegionDefinition region);
}

public sealed class TransactionApprovalService : ITransactionApprovalService
{
    private static readonly TimeOnly OpeningTime = new(8, 0);
    private static readonly TimeOnly ClosingTime = new(18, 0);

    public ApprovalResult Evaluate(DateTimeOffset submittedAtUtc, RegionDefinition region)
    {
        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(region.TimeZoneId);
        var localDateTime = TimeZoneInfo.ConvertTime(submittedAtUtc.ToUniversalTime(), timeZone);
        var localTime = TimeOnly.FromDateTime(localDateTime.DateTime);
        var approved = localTime >= OpeningTime && localTime < ClosingTime;

        return new ApprovalResult(localDateTime, approved);
    }
}
