using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Shva.Api.Data;

#nullable disable

namespace Shva.Api.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260722210000_AddAuthentication")]
public partial class AddAuthentication : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "UserId",
            table: "Transactions",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.CreateTable(
            name: "Users",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Email = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                NormalizedEmail = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                DisplayName = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                PasswordHash = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Users", x => x.Id));

        migrationBuilder.CreateIndex(
            name: "IX_Transactions_UserId",
            table: "Transactions",
            column: "UserId");

        migrationBuilder.CreateIndex(
            name: "IX_Users_NormalizedEmail",
            table: "Users",
            column: "NormalizedEmail",
            unique: true);

        migrationBuilder.AddForeignKey(
            name: "FK_Transactions_Users_UserId",
            table: "Transactions",
            column: "UserId",
            principalTable: "Users",
            principalColumn: "Id",
            onDelete: ReferentialAction.Cascade);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(name: "FK_Transactions_Users_UserId", table: "Transactions");
        migrationBuilder.DropTable(name: "Users");
        migrationBuilder.DropIndex(name: "IX_Transactions_UserId", table: "Transactions");
        migrationBuilder.DropColumn(name: "UserId", table: "Transactions");
    }
}
