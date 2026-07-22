using Shva.Api.Services;

namespace Shva.Api.Tests;

public sealed class TransactionApprovalServiceTests
{
    private readonly TransactionApprovalService _service = new();
    private readonly RegionCatalog _regions = new();

    [Theory]
    [InlineData("IL", "2026-01-15T06:00:00Z", true)]
    [InlineData("FR", "2026-07-15T06:00:00Z", true)]
    [InlineData("US", "2026-01-15T13:00:00Z", true)]
    [InlineData("JP", "2026-01-14T23:00:00Z", true)]
    [InlineData("CY", "2026-01-15T06:00:00Z", true)]
    [InlineData("IT", "2026-01-15T07:00:00Z", true)]
    public void ApprovesAtOpeningTimeForEveryRegion(string code, string instant, bool expected)
    {
        Assert.True(_regions.TryGet(code, out var region));
        var result = _service.Evaluate(DateTimeOffset.Parse(instant), region);
        Assert.Equal(expected, result.IsApproved);
        Assert.Equal(new TimeOnly(8, 0), TimeOnly.FromDateTime(result.LocalDateTime.DateTime));
    }

    [Theory]
    [InlineData("FR", "2026-07-15T15:59:59Z", true)]
    [InlineData("FR", "2026-07-15T16:00:00Z", false)]
    [InlineData("IL", "2026-01-15T15:59:59Z", true)]
    [InlineData("IL", "2026-01-15T16:00:00Z", false)]
    public void ClosingTimeIsExclusive(string code, string instant, bool expected)
    {
        Assert.True(_regions.TryGet(code, out var region));
        Assert.Equal(expected, _service.Evaluate(DateTimeOffset.Parse(instant), region).IsApproved);
    }

    [Fact]
    public void AppliesDaylightSavingRulesAtTheExactInstant()
    {
        Assert.True(_regions.TryGet("FR", out var france));

        var beforeTransition = _service.Evaluate(DateTimeOffset.Parse("2026-03-29T00:30:00Z"), france);
        var afterTransition = _service.Evaluate(DateTimeOffset.Parse("2026-03-29T01:30:00Z"), france);

        Assert.Equal("01:30", beforeTransition.LocalDateTime.ToString("HH:mm"));
        Assert.Equal("03:30", afterTransition.LocalDateTime.ToString("HH:mm"));
    }
}
