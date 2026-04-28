using MediatR;
using FEDomain;
using FEDomain.Interfaces;
using FECommon.Patterns;

namespace FarmEase.Features.Bookings.Commands;

/// <summary>
/// Command to update booking status (approve, reject, cancel, complete)
/// </summary>
public record UpdateBookingStatusCommand : IRequest<Result<Booking>>
{
    public int Id { get; init; }
    public required string Status { get; init; }
    public required string UserId { get; init; }
    public string? Reason { get; init; }
}

public class UpdateBookingStatusCommandHandler(IUnitOfWork unitOfWork, IAuditService auditService) 
    : IRequestHandler<UpdateBookingStatusCommand, Result<Booking>>
{
    private static readonly string[] ValidStatuses = ["Approved", "Rejected", "Cancelled", "Completed"];
    private static readonly string[] EmptyStatuses = [];
    private static readonly string[] PendingTransitions = ["Approved", "Rejected", "Cancelled"];
    private static readonly string[] ApprovedTransitions = ["Completed", "Cancelled"];
    
    private static readonly Dictionary<string, string[]> AllowedTransitions = new Dictionary<string, string[]>
    {
        { "Pending", PendingTransitions },
        { "Approved", ApprovedTransitions },
        { "Rejected", EmptyStatuses },
        { "Cancelled", EmptyStatuses },
        { "Completed", EmptyStatuses }
    };

    public async Task<Result<Booking>> Handle(UpdateBookingStatusCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var booking = await unitOfWork.Bookings.GetByIdAsync(request.Id);
            if (booking == null)
                return Result<Booking>.Failure("Booking not found");

            if (!ValidStatuses.Contains(request.Status))
                return Result<Booking>.Failure($"Invalid status. Valid statuses are: {string.Join(", ", ValidStatuses)}");

            // Authorization checks
            var isOwner = booking.OwnerId == request.UserId;
            var isFarmer = booking.FarmerId == request.UserId;

            // Only owner can approve/reject
            if ((request.Status == "Approved" || request.Status == "Rejected") && !isOwner)
                return Result<Booking>.Failure("Only the machine owner can approve or reject bookings");

            // Only farmer can cancel
            if (request.Status == "Cancelled" && !isFarmer)
                return Result<Booking>.Failure("Only the farmer can cancel bookings");

            // Only owner can mark as completed
            if (request.Status == "Completed" && !isOwner)
                return Result<Booking>.Failure("Only the machine owner can mark bookings as completed");

            // Status transition validation
            if (!AllowedTransitions.TryGetValue(booking.Status, out var allowed) || !allowed.Contains(request.Status))
                return Result<Booking>.Failure($"Cannot change status from '{booking.Status}' to '{request.Status}'");

            var oldStatus = booking.Status;
            booking.Status = request.Status;

            unitOfWork.Bookings.Update(booking);
            await unitOfWork.SaveChangesAsync();

            await auditService.LogAsync(booking, $"StatusChanged:{oldStatus}->{request.Status}", request.UserId);

            return Result<Booking>.Success(booking, $"Booking {request.Status.ToLower()} successfully");
        }
        catch (Exception ex)
        {
            return Result<Booking>.Failure($"Failed to update booking status: {ex.Message}");
        }
    }
}
