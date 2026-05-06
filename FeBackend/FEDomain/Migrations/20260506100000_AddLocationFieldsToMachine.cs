using Microsoft.EntityFrameworkCore.Migrations;

namespace FEDomain.Migrations
{
    /// <inheritdoc />
    public partial class AddLocationFieldsToMachine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add location-based search fields to Machines table
            migrationBuilder.AddColumn<double?>(
                name: "Latitude",
                table: "Machines",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double?>(
                name: "Longitude",
                table: "Machines",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Machines",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "Machines",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Pincode",
                table: "Machines",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            // Add index on Latitude and Longitude for efficient spatial queries
            migrationBuilder.CreateIndex(
                name: "IX_Machines_Latitude_Longitude",
                table: "Machines",
                columns: new[] { "Latitude", "Longitude" })
                .Annotation("SqlServer:Include", new[] { "Id", "Status" });

            // Add index on City for city-based searches
            migrationBuilder.CreateIndex(
                name: "IX_Machines_City",
                table: "Machines",
                column: "City");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Machines_City",
                table: "Machines");

            migrationBuilder.DropIndex(
                name: "IX_Machines_Latitude_Longitude",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "Pincode",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "State",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Machines");
        }
    }
}
