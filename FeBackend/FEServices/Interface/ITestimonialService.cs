using FECommon.DTO;

namespace FEServices.Interface
{
    public interface ITestimonialService
    {
        Task<IEnumerable<TestimonialDto>> GetActiveTestimonialsAsync();
        Task<IEnumerable<TestimonialDto>> GetAllTestimonialsAsync();
        Task<IEnumerable<TestimonialDto>> GetPendingTestimonialsAsync(); // For admin - needs approval
        Task<TestimonialDto?> GetTestimonialByIdAsync(int id);
        Task<TestimonialDto> CreateTestimonialAsync(CreateTestimonialDto request);
        Task<TestimonialDto> SubmitTestimonialAsync(SubmitTestimonialDto request, string? userId = null); // Public submission
        Task<TestimonialDto?> UpdateTestimonialAsync(int id, UpdateTestimonialDto request);
        Task<bool> DeleteTestimonialAsync(int id);
        Task<TestimonialDto?> ToggleTestimonialActiveAsync(int id);
        Task<TestimonialDto?> ApproveTestimonialAsync(int id); // Admin approves pending review
    }
}
