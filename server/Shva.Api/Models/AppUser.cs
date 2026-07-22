namespace Shva.Api.Models;

public sealed class AppUser
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string NormalizedEmail { get; set; }
    public required string DisplayName { get; set; }
    public required string PasswordHash { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = [];
}
