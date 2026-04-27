using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace FECommon.Patterns
{
    /// <summary>
    /// Specification pattern for encapsulating query logic
    /// Enables reusable, composable, and testable query specifications
    /// </summary>
    public interface ISpecification<T>
    {
        Expression<Func<T, bool>> Criteria { get; }
        List<Expression<Func<T, object>>> Includes { get; }
        List<string> IncludeStrings { get; }
        Expression<Func<T, object>>? OrderBy { get; }
        Expression<Func<T, object>>? OrderByDescending { get; }
        Expression<Func<T, object>>? ThenBy { get; }
        int Take { get; }
        int Skip { get; }
        bool IsPagingEnabled { get; }
        bool AsNoTracking { get; }
    }

    /// <summary>
    /// Base specification implementation
    /// </summary>
    public abstract class Specification<T> : ISpecification<T>
    {
        public Expression<Func<T, bool>> Criteria { get; protected set; } = _ => true;
        public List<Expression<Func<T, object>>> Includes { get; } = [];
        public List<string> IncludeStrings { get; } = [];
        public Expression<Func<T, object>>? OrderBy { get; protected set; }
        public Expression<Func<T, object>>? OrderByDescending { get; protected set; }
        public Expression<Func<T, object>>? ThenBy { get; protected set; }
        public int Take { get; protected set; }
        public int Skip { get; protected set; }
        public bool IsPagingEnabled { get; protected set; }
        public bool AsNoTracking { get; protected set; } = true;

        protected void AddCriteria(Expression<Func<T, bool>> criteria)
        {
            Criteria = criteria;
        }

        protected void AddInclude(Expression<Func<T, object>> includeExpression)
        {
            Includes.Add(includeExpression);
        }

        protected void AddInclude(string includeString)
        {
            IncludeStrings.Add(includeString);
        }

        protected void ApplyOrderBy(Expression<Func<T, object>> orderByExpression)
        {
            OrderBy = orderByExpression;
        }

        protected void ApplyOrderByDescending(Expression<Func<T, object>> orderByDescendingExpression)
        {
            OrderByDescending = orderByDescendingExpression;
        }

        protected void ApplyPaging(int skip, int take)
        {
            Skip = skip;
            Take = take;
            IsPagingEnabled = true;
        }

        protected void ApplyNoTracking(bool asNoTracking = true)
        {
            AsNoTracking = asNoTracking;
        }
    }

    /// <summary>
    /// Specification evaluator for applying specifications to IQueryable
    /// </summary>
    public static class SpecificationEvaluator
    {
        public static IQueryable<T> GetQuery<T>(IQueryable<T> inputQuery, ISpecification<T> specification) where T : class
        {
            var query = inputQuery;

            // Apply no tracking if specified
            if (specification.AsNoTracking)
                query = query.AsNoTracking();

            // Apply criteria (where clause)
            if (specification.Criteria != null)
                query = query.Where(specification.Criteria);

            // Apply includes
            foreach (var include in specification.Includes)
                query = query.Include(include);

            foreach (var includeString in specification.IncludeStrings)
                query = query.Include(includeString);

            // Apply ordering
            if (specification.OrderBy != null)
                query = query.OrderBy(specification.OrderBy);
            else if (specification.OrderByDescending != null)
                query = query.OrderByDescending(specification.OrderByDescending);

            // Apply paging
            if (specification.IsPagingEnabled)
                query = query.Skip(specification.Skip).Take(specification.Take);

            return query;
        }
    }

    // ============================================
    // COMMON SPECIFICATIONS
    // ============================================

    /// <summary>
    /// Specification for active entities
    /// </summary>
    public class ActiveEntitySpecification<T> : Specification<T> where T : class
    {
        public ActiveEntitySpecification()
        {
            // Add criteria for active status if entity has Status property
            var statusProperty = typeof(T).GetProperty("Status");
            if (statusProperty != null)
            {
                // This would be implemented with reflection or a common interface
            }
        }
    }

    /// <summary>
    /// Specification for paginated results
    /// </summary>
    public class PaginatedSpecification<T> : Specification<T> where T : class
    {
        public PaginatedSpecification(int page, int pageSize, Expression<Func<T, bool>>? criteria = null)
        {
            if (criteria != null)
                AddCriteria(criteria);

            ApplyPaging((page - 1) * pageSize, pageSize);
            ApplyOrderByDescending(e => EF.Property<object>(e!, "CreatedAt"));
        }
    }

    /// <summary>
    /// Specification for searching by text
    /// </summary>
    public class SearchSpecification<T> : Specification<T> where T : class
    {
        public SearchSpecification(string searchTerm, params Expression<Func<T, string>>[] searchProperties)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return;

            // Build search expression combining all properties
            var parameter = Expression.Parameter(typeof(T), "x");
            var searchTermConstant = Expression.Constant(searchTerm);

            Expression? combinedExpression = null;

            foreach (var property in searchProperties)
            {
                var propertyAccess = Expression.Invoke(property, parameter);
                var containsMethod = typeof(string).GetMethod("Contains", [typeof(string)])!;
                var containsCall = Expression.Call(propertyAccess, containsMethod, searchTermConstant);

                combinedExpression = combinedExpression == null
                    ? containsCall
                    : Expression.OrElse(combinedExpression, containsCall);
            }

            if (combinedExpression != null)
            {
                var lambda = Expression.Lambda<Func<T, bool>>(combinedExpression, parameter);
                AddCriteria(lambda);
            }
        }
    }
}
