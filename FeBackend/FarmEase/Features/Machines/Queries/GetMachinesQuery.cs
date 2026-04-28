using MediatR;
using FEDomain;
using FEDomain.Interfaces;
using FarmEase.Features.Common;

namespace FarmEase.Features.Machines.Queries;

/// <summary>
/// Query to get paginated list of machines with optional filtering
/// </summary>
public record GetMachinesQuery : IRequest<PaginatedResult<Machine>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? Type { get; init; }
    public string? Location { get; init; }
    public string? Status { get; init; }
    public string? SearchTerm { get; init; }
    public decimal? MinRate { get; init; }
    public decimal? MaxRate { get; init; }
    public string? OwnerId { get; init; }
    public string SortBy { get; init; } = "CreatedAt";
    public bool SortDescending { get; init; } = true;
}

public class GetMachinesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetMachinesQuery, PaginatedResult<Machine>>
{
    public async Task<PaginatedResult<Machine>> Handle(GetMachinesQuery request, CancellationToken cancellationToken)
    {
        var query = await unitOfWork.Machines.GetAllAsync();

        // Apply filters
        if (!string.IsNullOrEmpty(request.Type))
            query = query.Where(m => m.Type == request.Type);

        if (!string.IsNullOrEmpty(request.Location))
            query = query.Where(m => m.Location != null && m.Location.Contains(request.Location));

        if (!string.IsNullOrEmpty(request.Status))
            query = query.Where(m => m.Status == request.Status);

        if (!string.IsNullOrEmpty(request.OwnerId))
            query = query.Where(m => m.OwnerId == request.OwnerId);

        if (!string.IsNullOrEmpty(request.SearchTerm))
            query = query.Where(m => 
                m.Name.Contains(request.SearchTerm) || 
                (m.Description != null && m.Description.Contains(request.SearchTerm)));

        if (request.MinRate.HasValue)
            query = query.Where(m => m.Rate >= request.MinRate.Value);

        if (request.MaxRate.HasValue)
            query = query.Where(m => m.Rate <= request.MaxRate.Value);

        // Get total count before pagination
        var totalCount = query.Count();

        // Apply sorting
        query = request.SortBy.ToLower() switch
        {
            "name" => request.SortDescending ? query.OrderByDescending(m => m.Name) : query.OrderBy(m => m.Name),
            "rate" => request.SortDescending ? query.OrderByDescending(m => m.Rate) : query.OrderBy(m => m.Rate),
            "location" => request.SortDescending ? query.OrderByDescending(m => m.Location) : query.OrderBy(m => m.Location),
            _ => request.SortDescending ? query.OrderByDescending(m => m.CreatedAt) : query.OrderBy(m => m.CreatedAt)
        };

        // Apply pagination
        var items = query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        return new PaginatedResult<Machine>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
