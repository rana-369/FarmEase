using FEDomain.Interfaces;
using FECommon.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublicController(IUnitOfWork unitOfWork) : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;

        [HttpGet("stats")]
        [AllowAnonymous]
        [OutputCache(PolicyName = "PublicStats")]
        public async Task<IActionResult> GetPublicStats()
        {
            // Single query for user stats
            var userStats = await _unitOfWork.Users.Query()
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    TotalFarmers = g.Count(u => u.Role == "Farmer" || u.Role == "farmer"),
                    TotalOwners = g.Count(u => u.Role == "Owner" || u.Role == "owner")
                })
                .FirstOrDefaultAsync();

            // Single query for machine and booking stats
            var machineBookingStats = await _unitOfWork.Machines.Query()
                .Where(m => m.Status == "Active" || m.Status == "Verified")
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    TotalMachines = g.Count()
                })
                .FirstOrDefaultAsync();

            // Single query for booking count and average rating
            var bookingStats = await _unitOfWork.Bookings.Query()
                .Where(b => b.Status == "Completed")
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    TotalBookings = g.Count()
                })
                .FirstOrDefaultAsync();

            // Calculate average rating using SQL AVG (much more efficient)
            var averageRating = await _unitOfWork.Reviews.Query()
                .Where(r => r.Rating > 0)
                .AverageAsync(r => (double?)r.Rating) ?? 0.0;

            return Ok(new
            {
                TotalUsers = (userStats?.TotalFarmers ?? 0) + (userStats?.TotalOwners ?? 0),
                TotalMachines = machineBookingStats?.TotalMachines ?? 0,
                TotalBookings = bookingStats?.TotalBookings ?? 0,
                AverageRating = Math.Round(averageRating, 1)
            });
        }

        [HttpGet("featured-machines")]
        [AllowAnonymous]
        [OutputCache(PolicyName = "FeaturedMachines")]
        public async Task<IActionResult> GetFeaturedMachines([FromQuery] int limit = 6)
        {
            // Validate and sanitize pagination
            var (isValid, _, validLimit) = InputSanitizer.ValidatePagination(1, limit, 10);

            var machines = await _unitOfWork.Machines.Query()
                .Where(m => m.Status == "Active" || m.Status == "Verified")
                .OrderByDescending(m => m.CreatedAt)
                .Take(validLimit)
                .Select(m => new
                {
                    m.Id,
                    m.Name,
                    m.ImageUrl,
                    Location = m.Location ?? "Location not specified",
                    Rate = m.Rate,
                    m.Status
                })
                .ToListAsync();

            return Ok(machines);
        }
    }
}
