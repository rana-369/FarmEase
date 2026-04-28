using MediatR;
using FEDomain;
using FEDomain.Interfaces;
using FarmEase.Features.Common;

namespace FarmEase.Features.Bookings.Queries;


/// Query to get bookings for a user (as farmer or owner)
public record GetUserBookingsQuery : IRequest<PaginatedResult<Booking>>
{
    public required string UserId { get; init; }
    public string Role { get; init; } = "farmer";
    public string? Status { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}

public class GetUserBookingsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetUserBookingsQuery, PaginatedResult<Booking>>
{
    public async Task<PaginatedResult<Booking>> Handle(GetUserBookingsQuery request, CancellationToken cancellationToken)
    {
        var query = await unitOfWork.Bookings.GetAllAsync();

        // Filter by role
        query = request.Role.ToLower() switch
        {
            "farmer" => query.Where(b => b.FarmerId == request.UserId),
            "owner" => query.Where(b => b.OwnerId == request.UserId),
            _ => query.Where(b => b.FarmerId == request.UserId || b.OwnerId == request.UserId)
        };

        // Filter by status
        if (!string.IsNullOrEmpty(request.Status))
            query = query.Where(b => b.Status == request.Status);

        // Get total count
        var totalCount = query.Count();

        // Order by most recent first
        query = query.OrderByDescending(b => b.CreatedAt);

        // Paginate
        var items = query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        return new PaginatedResult<Booking>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
