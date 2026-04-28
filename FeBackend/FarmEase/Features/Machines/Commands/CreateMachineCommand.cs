using MediatR;
using FEDomain;
using FEDomain.Interfaces;
using FECommon.Patterns;

namespace FarmEase.Features.Machines.Commands;

/// <summary>
/// Command to create a new machine listing
/// </summary>
public record CreateMachineCommand : IRequest<Result<Machine>>
{
    public required string Name { get; init; }
    public required string Description { get; init; }
    public decimal Rate { get; init; }
    public required string Type { get; init; }
    public required string Location { get; init; }
    public string? ImageUrl { get; init; }
    public required string OwnerId { get; init; }
}

public class CreateMachineCommandHandler(IUnitOfWork unitOfWork, IAuditService auditService) 
    : IRequestHandler<CreateMachineCommand, Result<Machine>>
{
    public async Task<Result<Machine>> Handle(CreateMachineCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var machine = new Machine
            {
                Name = request.Name,
                Description = request.Description,
                Rate = request.Rate,
                Type = request.Type,
                Location = request.Location,
                ImageUrl = request.ImageUrl ?? string.Empty,
                OwnerId = request.OwnerId,
                Status = "Pending Verification",
                CreatedAt = DateTime.UtcNow
            };

            await unitOfWork.Machines.AddAsync(machine);
            await unitOfWork.SaveChangesAsync();

            await auditService.LogAsync(machine, "Created", request.OwnerId);

            return Result<Machine>.Success(machine, "Machine created successfully");
        }
        catch (Exception ex)
        {
            return Result<Machine>.Failure($"Failed to create machine: {ex.Message}");
        }
    }
}
