using System.ComponentModel.DataAnnotations;

namespace Shva.Api.Contracts;

public sealed class RegisterRequest
{
    [Required, StringLength(80, MinimumLength = 2)]
    public string DisplayName { get; init; } = string.Empty;

    [Required, EmailAddress, StringLength(320)]
    public string Email { get; init; } = string.Empty;

    [Required, StringLength(128, MinimumLength = 8)]
    public string Password { get; init; } = string.Empty;
}

public sealed class LoginRequest
{
    [Required, EmailAddress, StringLength(320)]
    public string Email { get; init; } = string.Empty;

    [Required, StringLength(128, MinimumLength = 8)]
    public string Password { get; init; } = string.Empty;
}

public sealed record UserResponse(Guid Id, string Email, string DisplayName);
