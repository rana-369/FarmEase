using MediatR;
using FEDomain;
using FEDomain.Interfaces;

namespace FarmEase.Features.Machines.Queries;

/// <summary>
/// Query to get a single machine by ID
/// </summary>
public record GetMachineByIdQuery : IRequest<Machine?>
{
    public int Id { get; init; }
}

public class GetMachineByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetMachineByIdQuery, Machine?>
{
    public async Task<Machine?> Handle(GetMachineByIdQuery request, CancellationToken cancellationToken)
    {
        return await unitOfWork.Machines.GetByIdAsync(request.Id);
    }
}
