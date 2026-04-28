using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RentalsController(
        IMachineService machineService, 
        IBookingService bookingService, 
        IUserService userService) : ControllerBase
    {
        private readonly IMachineService _machineService = machineService;
        private readonly IBookingService _bookingService = bookingService;
        private readonly IUserService _userService = userService;

        [HttpGet("stats")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRentalStats()
        {
            var machines = await _machineService.GetAllMachinesAsync();
            var bookings = await _bookingService.GetAllBookingsAsync();
            var users = await _userService.GetAllUsersAsync();

            return Ok(new
            {
                TotalEquipment = machines.Count(),
                TotalRentals = bookings.Count(),
                ActiveUsers = users.Count()
            });
        }
    }
}
