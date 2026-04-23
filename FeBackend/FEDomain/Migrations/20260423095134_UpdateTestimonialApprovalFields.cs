using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FEDomain.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTestimonialApprovalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "Testimonials",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SubmittedByUserId",
                table: "Testimonials",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "Testimonials");

            migrationBuilder.DropColumn(
                name: "SubmittedByUserId",
                table: "Testimonials");
        }
    }
}
