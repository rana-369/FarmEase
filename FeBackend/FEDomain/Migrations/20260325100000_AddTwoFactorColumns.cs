using Microsoft.EntityFrameworkCore.Migrations;

namespace FEDomain.Migrations
{
    public partial class AddTwoFactorColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TwoFactorMethod",
                table: "AspNetUsers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                defaultValue: "email");

            migrationBuilder.AddColumn<string>(
                name: "TwoFactorSecret",
                table: "AspNetUsers",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TwoFactorBackupCodes",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TwoFactorOtp",
                table: "AspNetUsers",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TwoFactorOtpExpiry",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TwoFactorMethod",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "TwoFactorSecret",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "TwoFactorBackupCodes",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "TwoFactorOtp",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "TwoFactorOtpExpiry",
                table: "AspNetUsers");
        }
    }
}
