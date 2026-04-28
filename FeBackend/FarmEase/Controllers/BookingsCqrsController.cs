using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FarmEase.Features.Bookings.Commands;
using FarmEase.Features.Bookings.Queries;
using FarmEase.Features.Common;
using System.Security.Claims;

namespace FarmEase.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsCqrsController(IMediator mediator) : ControllerBase
{
    private readonly IMediator _mediator = mediator;

    /// <summary>
    /// Get bookings for the current user (as farmer or owner)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMyBookings([FromQuery] string role = "farmer", [FromQuery] string? status = null, 
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var query = new GetUserBookingsQuery
        {
            UserId = userId,
            Role = role,
            Status = status,
            Page = page,
            PageSize = pageSize
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Create a new booking
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new CreateBookingCommand
        {
            MachineId = request.MachineId,
            FarmerId = userId,
            Hours = request.Hours
        };

        var result = await _mediator.Send(command);
        
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return CreatedAtAction(nameof(GetMyBookings), new { id = result.Data!.Id }, result.Data);
    }

    /// <summary>
    /// Update booking status (approve, reject, cancel, complete)
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] UpdateBookingStatusRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new UpdateBookingStatusCommand
        {
            Id = id,
            Status = request.Status,
            UserId = userId,
            Reason = request.Reason
        };

        var result = await _mediator.Send(command);
        
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }
}

// Request DTOs
public record CreateBookingRequest
{
    public int MachineId { get; init; }
    public int Hours { get; init; }
}

public record UpdateBookingStatusRequest
{
    public required string Status { get; init; }
    public string? Reason { get; init; }
}
