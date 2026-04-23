using AutoMapper;
using FEDomain;
using FEDTO.DTOs;
using FECommon.DTO;

namespace FEServices.Mapping
{
    /// <summary>
    /// AutoMapper profile for FarmEase application
    /// Contains all entity-to-DTO and DTO-to-entity mappings
    /// </summary>
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // ==================== USER MAPPINGS ====================
            
            // ApplicationUser -> UserProfileDto
            CreateMap<ApplicationUser, UserProfileDto>()
                .ForMember(dest => dest.IsSuspended, 
                    opt => opt.MapFrom(src => src.LockoutEnd.HasValue && 
                        src.LockoutEnd.Value > DateTimeOffset.UtcNow));

            // ApplicationUser -> FarmerSummaryDto
            CreateMap<ApplicationUser, FarmerSummaryDto>();
            
            // ApplicationUser -> OwnerSummaryDto (without MachineCount - handled separately)
            CreateMap<ApplicationUser, OwnerSummaryDto>()
                .ForMember(dest => dest.MachineCount, opt => opt.Ignore());

            // UserProfileUpdateDto -> ApplicationUser (for updates)
            CreateMap<UserProfileUpdateDto, ApplicationUser>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => src.Location))
                .ForMember(dest => dest.FarmSize, opt => opt.MapFrom(src => src.FarmSize))
                .ForMember(dest => dest.CompanyName, opt => opt.MapFrom(src => src.CompanyName))
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Role, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.ProfileImageUrl, opt => opt.Ignore())
                .ForMember(dest => dest.ResetOtp, opt => opt.Ignore())
                .ForMember(dest => dest.ResetOtpExpiry, opt => opt.Ignore())
                .ForMember(dest => dest.TwoFactorMethod, opt => opt.Ignore())
                .ForMember(dest => dest.TwoFactorSecret, opt => opt.Ignore())
                .ForMember(dest => dest.TwoFactorBackupCodes, opt => opt.Ignore())
                .ForMember(dest => dest.TwoFactorOtp, opt => opt.Ignore())
                .ForMember(dest => dest.TwoFactorOtpExpiry, opt => opt.Ignore())
                .ForMember(dest => dest.RazorpayAccountId, opt => opt.Ignore())
                .ForMember(dest => dest.RazorpayContactId, opt => opt.Ignore())
                .ForMember(dest => dest.IsPaymentOnboardingComplete, opt => opt.Ignore())
                .ForMember(dest => dest.PaymentOnboardingCompletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.RazorpayFundAccountId, opt => opt.Ignore())
                .ForMember(dest => dest.NormalizedEmail, opt => opt.Ignore())
                .ForMember(dest => dest.NormalizedUserName, opt => opt.Ignore())
                .ForMember(dest => dest.EmailConfirmed, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.SecurityStamp, opt => opt.Ignore())
                .ForMember(dest => dest.ConcurrencyStamp, opt => opt.Ignore())
                .ForMember(dest => dest.LockoutEnd, opt => opt.Ignore())
                .ForMember(dest => dest.LockoutEnabled, opt => opt.Ignore())
                .ForMember(dest => dest.AccessFailedCount, opt => opt.Ignore())
                .ForMember(dest => dest.TwoFactorEnabled, opt => opt.Ignore());

            // ==================== MACHINE MAPPINGS ====================
            
            // Machine -> MachineSummaryDto (basic mapping)
            CreateMap<Machine, MachineSummaryDto>()
                .ForMember(dest => dest.OwnerName, opt => opt.Ignore())
                .ForMember(dest => dest.OwnerLocation, opt => opt.Ignore());

            // ==================== BOOKING MAPPINGS ====================
            
            // Booking -> BookingSummaryDto (basic mapping)
            CreateMap<Booking, BookingSummaryDto>()
                .ForMember(dest => dest.IsRefunded, opt => opt.Ignore());

            // Booking -> BookingResponseDto
            CreateMap<Booking, BookingResponseDto>()
                .ForMember(dest => dest.OwnerId, opt => opt.MapFrom(src => src.OwnerId ?? string.Empty));

            // ==================== PAYMENT MAPPINGS ====================
            
            // Payment -> SettlementStatusDto
            CreateMap<Payment, SettlementStatusDto>()
                .ForMember(dest => dest.PaymentId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.SettlementStatus, opt => opt.MapFrom(src => src.SettlementStatus ?? "Pending"))
                .ForMember(dest => dest.TransferId, opt => opt.MapFrom(src => src.RazorpayTransferId));

            // ==================== DASHBOARD MAPPINGS ====================
            
            // Booking -> RecentBookingDto
            CreateMap<Booking, RecentBookingDto>();

            // ==================== REVIEW MAPPINGS ====================
            
            // Review -> ReviewResponseDto
            CreateMap<Review, ReviewResponseDto>()
                .ForMember(dest => dest.MachineName, opt => opt.MapFrom(src => src.MachineName ?? "Unknown"))
                .ForMember(dest => dest.FarmerName, opt => opt.MapFrom(src => src.FarmerName ?? "Unknown"));

            // ==================== TESTIMONIAL MAPPINGS ====================
            
            // Testimonial -> TestimonialDto
            CreateMap<Testimonial, TestimonialDto>()
                .ForMember(dest => dest.IsUserSubmitted, opt => opt.MapFrom(src => src.SubmittedByUserId != null));
        }
    }
}
