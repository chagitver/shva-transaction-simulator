using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Shva.Api.Data;

#nullable disable

namespace Shva.Api.Migrations;

[DbContext(typeof(AppDbContext))]
partial class AppDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder modelBuilder)
    {
#pragma warning disable 612, 618
        modelBuilder.HasAnnotation("ProductVersion", "8.0.24");

        modelBuilder.Entity("Shva.Api.Models.AppUser", entity =>
        {
            entity.Property<Guid>("Id").ValueGeneratedOnAdd().HasColumnType("uniqueidentifier");
            entity.Property<DateTimeOffset>("CreatedAtUtc").HasColumnType("datetimeoffset");
            entity.Property<string>("DisplayName").IsRequired().HasMaxLength(80).HasColumnType("nvarchar(80)");
            entity.Property<string>("Email").IsRequired().HasMaxLength(320).HasColumnType("nvarchar(320)");
            entity.Property<string>("NormalizedEmail").IsRequired().HasMaxLength(320).HasColumnType("nvarchar(320)");
            entity.Property<string>("PasswordHash").IsRequired().HasMaxLength(512).HasColumnType("nvarchar(512)");
            entity.HasKey("Id");
            entity.HasIndex("NormalizedEmail").IsUnique();
            entity.ToTable("Users");
        });

        modelBuilder.Entity("Shva.Api.Models.Transaction", entity =>
        {
            entity.Property<Guid>("Id").ValueGeneratedOnAdd().HasColumnType("uniqueidentifier");
            entity.Property<DateTimeOffset>("CreatedAtUtc").HasColumnType("datetimeoffset");
            entity.Property<DateTimeOffset>("LocalDateTime").HasColumnType("datetimeoffset");
            entity.Property<string>("RegionCode").IsRequired().HasMaxLength(8).HasColumnType("nvarchar(8)");
            entity.Property<string>("Status").IsRequired().HasMaxLength(16).HasColumnType("nvarchar(16)");
            entity.Property<DateTimeOffset>("SubmittedAtUtc").HasColumnType("datetimeoffset");
            entity.Property<string>("TimeZoneId").IsRequired().HasMaxLength(64).HasColumnType("nvarchar(64)");
            entity.Property<Guid?>("UserId").HasColumnType("uniqueidentifier");
            entity.HasKey("Id");
            entity.HasIndex("Status", "CreatedAtUtc");
            entity.HasIndex("UserId");
            entity.ToTable("Transactions");
        });

        modelBuilder.Entity("Shva.Api.Models.Transaction", entity =>
        {
            entity.HasOne("Shva.Api.Models.AppUser", "User")
                .WithMany("Transactions")
                .HasForeignKey("UserId")
                .OnDelete(DeleteBehavior.Cascade);
            entity.Navigation("User");
        });

        modelBuilder.Entity("Shva.Api.Models.AppUser", entity =>
        {
            entity.Navigation("Transactions");
        });
#pragma warning restore 612, 618
    }
}
