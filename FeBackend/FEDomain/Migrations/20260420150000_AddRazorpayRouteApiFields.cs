using Microsoft.EntityFrameworkCore.Migrations;

namespace FEDomain.Migrations
{
    /// <summary>
    /// Migration to add Razorpay Route API fields for owner payment settlements
    /// - ApplicationUser: Razorpay account IDs for receiving payments
    /// - Payment: Settlement tracking for automatic splits
    /// </summary>
    public partial class AddRazorpayRouteApiFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add Razorpay Route API fields to AspNetUsers table (ApplicationUser)
            migrationBuilder.AddColumn<string>(
                name: "RazorpayAccountId",
                table: "AspNetUsers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RazorpayContactId",
                table: "AspNetUsers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPaymentOnboardingComplete",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaymentOnboardingCompletedAt",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RazorpayFundAccountId",
                table: "AspNetUsers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            // Add settlement tracking fields to Payments table
            migrationBuilder.AddColumn<decimal>(
                name: "OwnerAmount",
                table: "Payments",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PlatformFeeAmount",
                table: "Payments",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "RazorpayTransferId",
                table: "Payments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SettlementStatus",
                table: "Payments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Pending");

            migrationBuilder.AddColumn<DateTime>(
                name: "SettledAt",
                table: "Payments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SettlementFailureReason",
                table: "Payments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            // Create index on SettlementStatus for faster queries
            migrationBuilder.CreateIndex(
                name: "IX_Payments_SettlementStatus",
                table: "Payments",
                column: "SettlementStatus");

            // Create index on RazorpayAccountId for owner lookups
            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_RazorpayAccountId",
                table: "AspNetUsers",
                column: "RazorpayAccountId",
                filter: "[RazorpayAccountId] IS NOT NULL");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop indexes
            migrationBuilder.DropIndex(
                name: "IX_Payments_SettlementStatus",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_RazorpayAccountId",
                table: "AspNetUsers");

            // Drop Payment settlement columns
            migrationBuilder.DropColumn(name: "OwnerAmount", table: "Payments");
            migrationBuilder.DropColumn(name: "PlatformFeeAmount", table: "Payments");
            migrationBuilder.DropColumn(name: "RazorpayTransferId", table: "Payments");
            migrationBuilder.DropColumn(name: "SettlementStatus", table: "Payments");
            migrationBuilder.DropColumn(name: "SettledAt", table: "Payments");
            migrationBuilder.DropColumn(name: "SettlementFailureReason", table: "Payments");

            // Drop ApplicationUser Razorpay columns
            migrationBuilder.DropColumn(name: "RazorpayAccountId", table: "AspNetUsers");
            migrationBuilder.DropColumn(name: "RazorpayContactId", table: "AspNetUsers");
            migrationBuilder.DropColumn(name: "IsPaymentOnboardingComplete", table: "AspNetUsers");
            migrationBuilder.DropColumn(name: "PaymentOnboardingCompletedAt", table: "AspNetUsers");
            migrationBuilder.DropColumn(name: "RazorpayFundAccountId", table: "AspNetUsers");
        }
    }
}
