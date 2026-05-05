using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FEDomain.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingOtpFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ArrivalOtp",
                table: "Bookings",
                type: "nvarchar(6)",
                maxLength: 6,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OtpGeneratedAt",
                table: "Bookings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkStartOtp",
                table: "Bookings",
                type: "nvarchar(6)",
                maxLength: 6,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArrivalOtp",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "OtpGeneratedAt",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "WorkStartOtp",
                table: "Bookings");
        }
    }
}
