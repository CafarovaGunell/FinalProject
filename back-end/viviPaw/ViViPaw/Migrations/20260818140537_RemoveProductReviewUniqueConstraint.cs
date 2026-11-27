using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ViViPaw.Migrations
{
    /// <inheritdoc />
    public partial class RemoveProductReviewUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductReviews_AppUserId_ProductId",
                table: "ProductReviews");

            migrationBuilder.CreateIndex(
                name: "IX_ProductReviews_AppUserId_ProductId",
                table: "ProductReviews",
                columns: new[] { "AppUserId", "ProductId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductReviews_AppUserId_ProductId",
                table: "ProductReviews");

            migrationBuilder.CreateIndex(
                name: "IX_ProductReviews_AppUserId_ProductId",
                table: "ProductReviews",
                columns: new[] { "AppUserId", "ProductId" },
                unique: true);
        }
    }
}
