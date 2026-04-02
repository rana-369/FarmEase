using Microsoft.EntityFrameworkCore.Migrations;

namespace FEDomain.Migrations
{
    /// <summary>
    /// Adds navigation properties and fixes decimal precision for Rate.
    /// Removes redundant MachineName and FarmerName columns from Bookings.
    /// </summary>
    public partial class AddNavigationPropertiesAndFixDecimalRate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Change Machine.Rate from int to decimal(18,2)
            migrationBuilder.AlterColumn<decimal>(
                name: "Rate",
                table: "Machines",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            // 2. Drop redundant columns from Bookings (data normalization)
            // Note: If you need to preserve this data, backup before running migration
            migrationBuilder.DropColumn(
                name: "MachineName",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "FarmerName",
                table: "Bookings");

            // 3. Add foreign key constraints for navigation properties
            // Booking -> Machine
            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Machines_MachineId",
                table: "Bookings",
                column: "MachineId",
                principalTable: "Machines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // Booking -> ApplicationUser (Farmer)
            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_AspNetUsers_FarmerId",
                table: "Bookings",
                column: "FarmerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // Booking -> ApplicationUser (Owner)
            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_AspNetUsers_OwnerId",
                table: "Bookings",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // Machine -> ApplicationUser (Owner)
            migrationBuilder.AddForeignKey(
                name: "FK_Machines_AspNetUsers_OwnerId",
                table: "Machines",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove foreign keys
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Machines_MachineId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_AspNetUsers_FarmerId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_AspNetUsers_OwnerId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_Machines_AspNetUsers_OwnerId",
                table: "Machines");

            // Restore dropped columns
            migrationBuilder.AddColumn<string>(
                name: "MachineName",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FarmerName",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            // Revert Rate to int
            migrationBuilder.AlterColumn<int>(
                name: "Rate",
                table: "Machines",
                type: "int",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");
        }
    }
}
