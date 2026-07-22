using Microsoft.EntityFrameworkCore;
using Shva.Api.Models;

namespace Shva.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<AppUser> Users => Set<AppUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var transaction = modelBuilder.Entity<Transaction>();
        transaction.ToTable("Transactions");
        transaction.HasKey(item => item.Id);
        transaction.Property(item => item.RegionCode).HasMaxLength(8).IsRequired();
        transaction.Property(item => item.TimeZoneId).HasMaxLength(64).IsRequired();
        transaction.Property(item => item.SubmittedAtUtc).HasColumnType("datetimeoffset");
        transaction.Property(item => item.LocalDateTime).HasColumnType("datetimeoffset");
        transaction.Property(item => item.CreatedAtUtc).HasColumnType("datetimeoffset");
        transaction.Property(item => item.Status).HasConversion<string>().HasMaxLength(16);
        transaction.HasIndex(item => new { item.Status, item.CreatedAtUtc });
        transaction.HasOne(item => item.User)
            .WithMany(user => user.Transactions)
            .HasForeignKey(item => item.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        var user = modelBuilder.Entity<AppUser>();
        user.ToTable("Users");
        user.HasKey(item => item.Id);
        user.Property(item => item.Email).HasMaxLength(320).IsRequired();
        user.Property(item => item.NormalizedEmail).HasMaxLength(320).IsRequired();
        user.Property(item => item.DisplayName).HasMaxLength(80).IsRequired();
        user.Property(item => item.PasswordHash).HasMaxLength(512).IsRequired();
        user.Property(item => item.CreatedAtUtc).HasColumnType("datetimeoffset");
        user.HasIndex(item => item.NormalizedEmail).IsUnique();
    }
}
