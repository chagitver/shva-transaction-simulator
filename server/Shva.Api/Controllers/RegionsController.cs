using Microsoft.AspNetCore.Mvc;
using Shva.Api.Contracts;
using Shva.Api.Services;

namespace Shva.Api.Controllers;

[ApiController]
[Route("api/regions")]
public sealed class RegionsController(IRegionCatalog catalog) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyCollection<RegionResponse>>(StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyCollection<RegionResponse>> GetAll() =>
        Ok(catalog.GetAll().Select(region => new RegionResponse(region.Code, region.Name, region.TimeZoneId)));
}
