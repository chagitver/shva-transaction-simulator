using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Shva.Api.Data;

#nullable disable

namespace Shva.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260722180000_InitialCreate")]
public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Transactions",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                RegionCode = table.Column<string>(type: "nvarchar(8)", maxLength: 8, nullable: false),
                TimeZoneId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                SubmittedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                LocalDateTime = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                Status = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Transactions", x => x.Id));

        migrationBuilder.CreateIndex(
            name: "IX_Transactions_Status_CreatedAtUtc",
            table: "Transactions",
            columns: new[] { "Status", "CreatedAtUtc" });
    }

    protected override void Down(MigrationBuilder migrationBuilder) =>
        migrationBuilder.DropTable(name: "Transactions");
}
