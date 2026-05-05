using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FEDomain.Migrations
{
    /// <inheritdoc />
    public partial class AddScheduledDateTimeToBooking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledDate",
                table: "Bookings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ScheduledTime",
                table: "Bookings",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ScheduledDate",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ScheduledTime",
                table: "Bookings");
        }
    }
}
