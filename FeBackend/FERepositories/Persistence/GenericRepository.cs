using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using FEDomain.Interfaces;
using FEDomain.Data;

namespace FERepositories.Persistence
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly ApplicationDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public GenericRepository(ApplicationDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public IQueryable<T> Query() => _dbSet.AsQueryable();

        public IQueryable<T> QueryNoTracking() => _dbSet.AsNoTracking();

        private IQueryable<T> ApplyIncludes(params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet;
            foreach (var include in includes)
            {
                query = query.Include(include);
            }
            return query;
        }

        private IQueryable<T> ApplyIncludesNoTracking(params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _dbSet.AsNoTracking();
            foreach (var include in includes)
            {
                query = query.Include(include);
            }
            return query;
        }

        // GetByIdAsync keeps tracking for updates
        public async Task<T?> GetByIdAsync(int id) => await _dbSet.FindAsync(id);
        public async Task<T?> GetByIdAsync(string id) => await _dbSet.FindAsync(id);

        // Read-only methods use AsNoTracking for performance
        public async Task<IEnumerable<T>> GetAllAsync(params Expression<Func<T, object>>[] includes)
            => await ApplyIncludesNoTracking(includes).ToListAsync();

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, params Expression<Func<T, object>>[] includes)
            => await ApplyIncludesNoTracking(includes).Where(predicate).ToListAsync();

        public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, params Expression<Func<T, object>>[] includes)
            => await ApplyIncludesNoTracking(includes).FirstOrDefaultAsync(predicate);

        public async Task<IEnumerable<T>> GetPagedAsync(int pageNumber, int pageSize, params Expression<Func<T, object>>[] includes)
            => await ApplyIncludesNoTracking(includes).Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();

        public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);
        public async Task AddRangeAsync(IEnumerable<T> entities) => await _dbSet.AddRangeAsync(entities);

        public void Update(T entity) => _dbSet.Update(entity);
        public void UpdateRange(IEnumerable<T> entities) => _dbSet.UpdateRange(entities);
        public void Delete(T entity) => _dbSet.Remove(entity);
        public void DeleteRange(IEnumerable<T> entities) => _dbSet.RemoveRange(entities);

        public async Task<int> CountAsync() => await _dbSet.AsNoTracking().CountAsync();
        public async Task<int> CountAsync(Expression<Func<T, bool>> predicate) => await _dbSet.AsNoTracking().CountAsync(predicate);
        public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate) => await _dbSet.AsNoTracking().AnyAsync(predicate);
    }
}