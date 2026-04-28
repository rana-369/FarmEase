using MediatR;
using FEDomain;
using FEDomain.Interfaces;
using FECommon.Patterns;

namespace FarmEase.Features.Bookings.Commands;

/// <summary>
/// Command to create a new booking
/// </summary>
public record CreateBookingCommand : IRequest<Result<Booking>>
{
    public int MachineId { get; init; }
    public required string FarmerId { get; init; }
    public int Hours { get; init; }
}

public class CreateBookingCommandHandler(IUnitOfWork unitOfWork, IAuditService auditService) 
    : IRequestHandler<CreateBookingCommand, Result<Booking>>
{
    public async Task<Result<Booking>> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate hours
            if (request.Hours <= 0)
                return Result<Booking>.Failure("Hours must be greater than zero");

            // Get machine
            var machine = await unitOfWork.Machines.GetByIdAsync(request.MachineId);
            if (machine == null)
                return Result<Booking>.Failure("Machine not found");

            if (machine.Status != "Available" && machine.Status != "Verified")
                return Result<Booking>.Failure("Machine is not available for booking");

            if (machine.OwnerId == request.FarmerId)
                return Result<Booking>.Failure("You cannot book your own machine");

            // Calculate amounts
            var baseAmount = request.Hours * machine.Rate;
            var platformFee = baseAmount * 0.10m; // 10% platform fee
            var totalAmount = baseAmount + platformFee;

            var booking = new Booking
            {
                MachineId = request.MachineId,
                MachineName = machine.Name,
                FarmerId = request.FarmerId,
                OwnerId = machine.OwnerId,
                Hours = request.Hours,
                BaseAmount = baseAmount,
                PlatformFee = platformFee,
                TotalAmount = totalAmount,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            await unitOfWork.Bookings.AddAsync(booking);
            await unitOfWork.SaveChangesAsync();

            await auditService.LogAsync(booking, "Created", request.FarmerId);

            return Result<Booking>.Success(booking, "Booking created successfully");
        }
        catch (Exception ex)
        {
            return Result<Booking>.Failure($"Failed to create booking: {ex.Message}");
        }
    }
}
