namespace Shva.Api.Models;

public enum TransactionStatus
{
    Approved,
    Rejected
}

public sealed class Transaction
{
    public Guid Id { get; set; }
    public required string RegionCode { get; set; }
    public required string TimeZoneId { get; set; }
    public DateTimeOffset SubmittedAtUtc { get; set; }
    public DateTimeOffset LocalDateTime { get; set; }
    public TransactionStatus Status { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public Guid? UserId { get; set; }
    public AppUser? User { get; set; }
}
