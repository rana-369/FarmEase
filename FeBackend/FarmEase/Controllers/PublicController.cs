using FEDomain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublicController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public PublicController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("stats")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicStats()
        {
            var totalMachines = await _unitOfWork.Machines.Query()
                .Where(m => m.Status == "Active" || m.Status == "Verified")
                .CountAsync();

            var totalFarmers = await _unitOfWork.Users.Query()
                .Where(u => u.Role == "Farmer" || u.Role == "farmer")
                .CountAsync();

            var totalOwners = await _unitOfWork.Users.Query()
                .Where(u => u.Role == "Owner" || u.Role == "owner")
                .CountAsync();

            var totalBookings = await _unitOfWork.Bookings.Query()
                .Where(b => b.Status == "Completed")
                .CountAsync();

            return Ok(new
            {
                TotalUsers = totalFarmers + totalOwners,
                TotalMachines = totalMachines,
                TotalBookings = totalBookings,
                AverageRating = 4.5
            });
        }

        [HttpGet("featured-machines")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFeaturedMachines()
        {
            var machines = await _unitOfWork.Machines.Query()
                .Where(m => m.Status == "Active" || m.Status == "Verified")
                .OrderByDescending(m => m.CreatedAt)
                .Take(6)
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
