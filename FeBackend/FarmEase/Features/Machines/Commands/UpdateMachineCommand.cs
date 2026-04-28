using MediatR;
using FEDomain;
using FEDomain.Interfaces;
using FECommon.Patterns;

namespace FarmEase.Features.Machines.Commands;

/// <summary>
/// Command to update an existing machine
/// </summary>
public record UpdateMachineCommand : IRequest<Result<Machine>>
{
    public int Id { get; init; }
    public required string Name { get; init; }
    public required string Description { get; init; }
    public decimal Rate { get; init; }
    public required string Type { get; init; }
    public required string Location { get; init; }
    public string? ImageUrl { get; init; }
    public required string Status { get; init; }
    public required string OwnerId { get; init; }
}

public class UpdateMachineCommandHandler(IUnitOfWork unitOfWork, IAuditService auditService) 
    : IRequestHandler<UpdateMachineCommand, Result<Machine>>
{
    public async Task<Result<Machine>> Handle(UpdateMachineCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var machine = await unitOfWork.Machines.GetByIdAsync(request.Id);
            if (machine == null)
                return Result<Machine>.Failure("Machine not found");

            if (machine.OwnerId != request.OwnerId)
                return Result<Machine>.Failure("Unauthorized: You don't own this machine");

            var oldValues = new { machine.Name, machine.Description, machine.Rate, machine.Type, machine.Location, machine.Status };
            
            machine.Name = request.Name;
            machine.Description = request.Description;
            machine.Rate = request.Rate;
            machine.Type = request.Type;
            machine.Location = request.Location;
            machine.ImageUrl = request.ImageUrl ?? machine.ImageUrl;
            machine.Status = request.Status;

            unitOfWork.Machines.Update(machine);
            await unitOfWork.SaveChangesAsync();

            var newValues = new { machine.Name, machine.Description, machine.Rate, machine.Type, machine.Location, machine.Status };
            await auditService.LogAsync(machine, "Updated", request.OwnerId, null, oldValues, newValues);

            return Result<Machine>.Success(machine, "Machine updated successfully");
        }
        catch (Exception ex)
        {
            return Result<Machine>.Failure($"Failed to update machine: {ex.Message}");
        }
    }
}
