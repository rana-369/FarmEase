using Microsoft.EntityFrameworkCore.Migrations;

namespace FEDomain.Migrations
{
    /// <summary>
    /// Reverts the problematic changes - restores denormalized columns and removes FK constraints.
    /// This fixes the 500 errors caused by missing columns.
    /// </summary>
    public partial class RestoreDenormalizedColumnsAndRemoveFKs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Drop foreign key constraints that were added
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

            // 2. Re-add MachineName column (nullable to handle existing data)
            migrationBuilder.AddColumn<string>(
                name: "MachineName",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: true);

            // 3. Re-add FarmerName column (nullable to handle existing data)
            migrationBuilder.AddColumn<string>(
                name: "FarmerName",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: true);

            // 4. Populate the columns from related tables for existing bookings
            // Update MachineName from Machines table
            migrationBuilder.Sql(@"
                UPDATE b
                SET b.MachineName = m.Name
                FROM Bookings b
                INNER JOIN Machines m ON b.MachineId = m.Id
                WHERE b.MachineName IS NULL
            ");

            // Update FarmerName from AspNetUsers table
            migrationBuilder.Sql(@"
                UPDATE b
                SET b.FarmerName = u.FullName
                FROM Bookings b
                INNER JOIN AspNetUsers u ON b.FarmerId = u.Id
                WHERE b.FarmerName IS NULL
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop the restored columns
            migrationBuilder.DropColumn(
                name: "MachineName",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "FarmerName",
                table: "Bookings");

            // Re-add foreign keys
            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Machines_MachineId",
                table: "Bookings",
                column: "MachineId",
                principalTable: "Machines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_AspNetUsers_FarmerId",
                table: "Bookings",
                column: "FarmerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_AspNetUsers_OwnerId",
                table: "Bookings",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Machines_AspNetUsers_OwnerId",
                table: "Machines",
                column: "OwnerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
