using MediatR;
using FEDomain;
using FEDomain.Interfaces;
using FECommon.Patterns;

namespace FarmEase.Features.Machines.Commands;

/// <summary>
/// Command to delete a machine
/// </summary>
public record DeleteMachineCommand : IRequest<Result<bool>>
{
    public int Id { get; init; }
    public required string OwnerId { get; init; }
}

public class DeleteMachineCommandHandler(IUnitOfWork unitOfWork, IAuditService auditService) 
    : IRequestHandler<DeleteMachineCommand, Result<bool>>
{
    public async Task<Result<bool>> Handle(DeleteMachineCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var machine = await unitOfWork.Machines.GetByIdAsync(request.Id);
            if (machine == null)
                return Result<bool>.Failure("Machine not found");

            if (machine.OwnerId != request.OwnerId)
                return Result<bool>.Failure("Unauthorized: You don't own this machine");

            // Check for active bookings
            var activeBookings = await unitOfWork.Bookings.FindAsync(b => 
                b.MachineId == request.Id && 
                (b.Status == "Pending" || b.Status == "Confirmed" || b.Status == "Active"));
            
            if (activeBookings.Count() != 0)
                return Result<bool>.Failure("Cannot delete machine with active bookings");

            await auditService.LogAsync(machine, "Deleted", request.OwnerId);

            unitOfWork.Machines.Delete(machine);
            await unitOfWork.SaveChangesAsync();

            return Result<bool>.Success(true, "Machine deleted successfully");
        }
        catch (Exception ex)
        {
            return Result<bool>.Failure($"Failed to delete machine: {ex.Message}");
        }
    }
}
