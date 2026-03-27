using Microsoft.EntityFrameworkCore.Migrations;

namespace FEDomain.Migrations
{
    public partial class AddMachineLocationDescription : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Machines",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Machines",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Machines");
        }
    }
}
