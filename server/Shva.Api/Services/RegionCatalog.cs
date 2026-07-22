using Shva.Api.Contracts;

namespace Shva.Api.Services;

public sealed record RegionDefinition(string Code, LocalizedName Name, string TimeZoneId);

public interface IRegionCatalog
{
    IReadOnlyCollection<RegionDefinition> GetAll();
    bool TryGet(string code, out RegionDefinition region);
}

public sealed class RegionCatalog : IRegionCatalog
{
    private static readonly RegionDefinition[] Regions =
    [
        new("IL", new("Israel", "ישראל"), "Asia/Jerusalem"),
        new("FR", new("France", "צרפת"), "Europe/Paris"),
        new("US", new("USA (New York)", "ארה״ב (ניו יורק)"), "America/New_York"),
        new("JP", new("Japan", "יפן"), "Asia/Tokyo"),
        new("CY", new("Cyprus", "קפריסין"), "Asia/Nicosia"),
        new("IT", new("Italy", "איטליה"), "Europe/Rome")
    ];

    private static readonly IReadOnlyDictionary<string, RegionDefinition> ByCode =
        Regions.ToDictionary(region => region.Code, StringComparer.OrdinalIgnoreCase);

    public IReadOnlyCollection<RegionDefinition> GetAll() => Regions;

    public bool TryGet(string code, out RegionDefinition region) =>
        ByCode.TryGetValue(code ?? string.Empty, out region!);
}
