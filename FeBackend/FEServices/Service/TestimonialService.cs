using AutoMapper;
using FECommon.DTO;
using FECommon.Exceptions;
using FEDomain;
using FEDomain.Interfaces;
using FEServices.Interface;
using Microsoft.EntityFrameworkCore;

namespace FEServices.Service
{
    public class TestimonialService : ITestimonialService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TestimonialService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        // Public endpoint - only approved AND active testimonials
        public async Task<IEnumerable<TestimonialDto>> GetActiveTestimonialsAsync()
        {
            try
            {
                var testimonials = await _unitOfWork.Testimonials.Query()
                    .AsNoTracking()
                    .Where(t => t.IsActive && t.IsApproved)
                    .OrderBy(t => t.DisplayOrder)
                    .ThenByDescending(t => t.CreatedAt)
                    .ToListAsync();
                return _mapper.Map<IEnumerable<TestimonialDto>>(testimonials);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve testimonials", ex);
            }
        }

        // Admin - all testimonials
        public async Task<IEnumerable<TestimonialDto>> GetAllTestimonialsAsync()
        {
            try
            {
                var testimonials = await _unitOfWork.Testimonials.Query()
                    .AsNoTracking()
                    .OrderByDescending(t => t.CreatedAt)
                    .ToListAsync();
                return _mapper.Map<IEnumerable<TestimonialDto>>(testimonials);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve testimonials", ex);
            }
        }

        // Admin - testimonials pending approval (low ratings)
        public async Task<IEnumerable<TestimonialDto>> GetPendingTestimonialsAsync()
        {
            try
            {
                var testimonials = await _unitOfWork.Testimonials.Query()
                    .AsNoTracking()
                    .Where(t => !t.IsApproved && t.SubmittedByUserId != null)
                    .OrderByDescending(t => t.CreatedAt)
                    .ToListAsync();
                return _mapper.Map<IEnumerable<TestimonialDto>>(testimonials);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve pending testimonials", ex);
            }
        }

        public async Task<TestimonialDto?> GetTestimonialByIdAsync(int id)
        {
            try
            {
                var testimonial = await _unitOfWork.Testimonials.GetByIdAsync(id);
                return testimonial == null ? null : _mapper.Map<TestimonialDto>(testimonial);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve testimonial", ex);
            }
        }

        // Admin creates testimonial - always approved
        public async Task<TestimonialDto> CreateTestimonialAsync(CreateTestimonialDto request)
        {
            try
            {
                var testimonial = new Testimonial
                {
                    AuthorName = request.AuthorName.Trim(),
                    AuthorRole = request.AuthorRole.Trim(),
                    Content = request.Content.Trim(),
                    Rating = request.Rating,
                    AuthorLocation = request.AuthorLocation?.Trim(),
                    IsActive = request.IsActive,
                    IsApproved = true, // Admin-created is always approved
                    SubmittedByUserId = null, // Admin-created
                    DisplayOrder = request.DisplayOrder,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Testimonials.AddAsync(testimonial);
                await _unitOfWork.SaveChangesAsync();

                return _mapper.Map<TestimonialDto>(testimonial);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to create testimonial", ex);
            }
        }

        // Public user submission - auto-approve 4-5 stars, pending for 1-3 stars
        public async Task<TestimonialDto> SubmitTestimonialAsync(SubmitTestimonialDto request, string? userId = null)
        {
            try
            {
                // Auto-approve if rating is 4 or 5, otherwise needs admin approval
                var isAutoApproved = request.Rating >= 4;

                var testimonial = new Testimonial
                {
                    AuthorName = request.AuthorName.Trim(),
                    AuthorRole = request.AuthorRole.Trim(),
                    Content = request.Content.Trim(),
                    Rating = request.Rating,
                    AuthorLocation = request.AuthorLocation?.Trim(),
                    IsActive = true,
                    IsApproved = isAutoApproved, // Auto-approve for 4-5 stars
                    SubmittedByUserId = userId, // Track who submitted
                    DisplayOrder = 0,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Testimonials.AddAsync(testimonial);
                await _unitOfWork.SaveChangesAsync();

                return _mapper.Map<TestimonialDto>(testimonial);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to submit testimonial", ex);
            }
        }

        public async Task<TestimonialDto?> UpdateTestimonialAsync(int id, UpdateTestimonialDto request)
        {
            try
            {
                var testimonial = await _unitOfWork.Testimonials.GetByIdAsync(id);
                if (testimonial == null)
                    return null;

                testimonial.AuthorName = request.AuthorName.Trim();
                testimonial.AuthorRole = request.AuthorRole.Trim();
                testimonial.Content = request.Content.Trim();
                testimonial.Rating = request.Rating;
                testimonial.AuthorLocation = request.AuthorLocation?.Trim();
                testimonial.IsActive = request.IsActive;
                testimonial.IsApproved = request.IsApproved;
                testimonial.DisplayOrder = request.DisplayOrder;
                testimonial.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.SaveChangesAsync();

                return _mapper.Map<TestimonialDto>(testimonial);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to update testimonial", ex);
            }
        }

        public async Task<bool> DeleteTestimonialAsync(int id)
        {
            try
            {
                var testimonial = await _unitOfWork.Testimonials.GetByIdAsync(id);
                if (testimonial == null)
                    return false;

                _unitOfWork.Testimonials.Delete(testimonial);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to delete testimonial", ex);
            }
        }

        public async Task<TestimonialDto?> ToggleTestimonialActiveAsync(int id)
        {
            try
            {
                var testimonial = await _unitOfWork.Testimonials.GetByIdAsync(id);
                if (testimonial == null)
                    return null;

                testimonial.IsActive = !testimonial.IsActive;
                testimonial.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.SaveChangesAsync();

                return _mapper.Map<TestimonialDto>(testimonial);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to toggle testimonial status", ex);
            }
        }

        // Admin approves a pending testimonial (for low ratings)
        public async Task<TestimonialDto?> ApproveTestimonialAsync(int id)
        {
            try
            {
                var testimonial = await _unitOfWork.Testimonials.GetByIdAsync(id);
                if (testimonial == null)
                    return null;

                testimonial.IsApproved = true;
                testimonial.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.SaveChangesAsync();

                return _mapper.Map<TestimonialDto>(testimonial);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to approve testimonial", ex);
            }
        }
    }
}
