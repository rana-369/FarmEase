using System.Text;
using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using FEDomain.Interfaces;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.ResponseCompression;
// --- ARCHITECTURE NAMESPACES ---
using FEDomain;
using FEDomain.Data;
using FERepositories.Persistence;
using FEServices.Interface;
using FEServices.Service;
using FarmEase.Middleware;
using FEServices.Mapping;
using FECommon.Security;
using FECommon.Patterns;

var builder = WebApplication.CreateBuilder(args);

// --- 1. DATABASE CONTEXT ---
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(maxRetryCount: 3);
            sqlOptions.CommandTimeout(30);
        }));

// --- 1.1. RESPONSE & OUTPUT CACHING ---
builder.Services.AddResponseCaching();
builder.Services.AddMemoryCache();

// Output caching for public endpoints (30 seconds for stats, 60 seconds for featured)
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder.Expire(TimeSpan.FromSeconds(30)));
    options.AddPolicy("PublicStats", builder => builder.Expire(TimeSpan.FromSeconds(30)).SetVaryByHost(true));
    options.AddPolicy("FeaturedMachines", builder => builder.Expire(TimeSpan.FromSeconds(60)).SetVaryByHost(true));
    options.AddPolicy("NoCache", builder => builder.NoCache());
});

// --- 1.2. RESPONSE COMPRESSION ---
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
    options.Providers.Add<BrotliCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
        new[] { "application/json", "text/json", "application/ld+json" }
    );
});
builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Optimal;
});
builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = System.IO.Compression.CompressionLevel.Optimal;
});

// --- 1.5. UNIT OF WORK & REPOSITORY REGISTRATIONS ---
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IMachineRepository, MachineRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();

// --- 1.6. SERVICE REGISTRATIONS ---
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<ITestimonialService, TestimonialService>();

// --- 1.7. RATE LIMITING ---
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    
    // Auth endpoints - strict rate limiting (5 requests per minute)
    options.AddPolicy("AuthPolicy", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 2
            }));
    
    // General API - moderate rate limiting (100 requests per minute)
    options.AddPolicy("ApiPolicy", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4
            }));
});

// --- 2. IDENTITY SETUP ---
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
    options.Lockout.AllowedForNewUsers = true;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// --- 3. JWT AUTHENTICATION (SECURE) ---
// Use secure configuration that checks environment variables first
var jwtSettings = SecureConfiguration.GetJwtSettings(builder.Configuration);

if (string.IsNullOrEmpty(jwtSettings.Secret))
    throw new Exception("JWT Secret is missing. Set JWT_SECRET environment variable or JWT:Secret in appsettings.json");

var key = Encoding.UTF8.GetBytes(jwtSettings.Secret);

// Determine if we should require HTTPS (production only)
var isProduction = SecureConfiguration.IsProduction(builder.Configuration);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Only allow HTTP in development, require HTTPS in production
    options.RequireHttpsMetadata = isProduction;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = jwtSettings.ValidIssuer,
        ValidAudience = jwtSettings.ValidAudience,
        ClockSkew = TimeSpan.FromMinutes(5),
        // Additional security validations
        RequireExpirationTime = true,
        ValidateLifetime = true
    };
});

// --- 4. AUTHORIZE POLICIES ---
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireAdminRole", policy => policy.RequireRole("admin", "Admin"))
    .AddPolicy("RequireOwnerRole", policy => policy.RequireRole("owner", "Owner"));

// --- 5. SERVICES (Dependency Injection) ---
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IMachineService, MachineService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

// --- 5.1. AUTOMAPPER ---
builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

// --- 5.2. MEDIATR (CQRS PATTERN) ---
builder.Services.AddMediatR(typeof(Program));

// --- 5.3. AUDIT SERVICE ---
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuditService, AuditService>();

// --- 6. CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("FarmEasePolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "https://localhost:5173", "https://localhost:5174", "https://localhost:7284")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// --- 7. CONTROLLERS & SWAGGER ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase; // Revert to default camelCase naming policy
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FarmEase API",
        Version = "v1",
        Description = "Agriculture Equipment Rental Platform"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// --- 7.1. HEALTH CHECKS ---
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>("database", tags: ["db", "sql"])
    .AddCheck<DatabaseHealthCheck>("database-connectivity", tags: ["db"]);

builder.Services.AddHealthChecksUI(settings =>
{
    settings.AddHealthCheckEndpoint("FarmEase API", "/health-ui");
}).AddInMemoryStorage();

var app = builder.Build();

// --- 8. AUTO MIGRATION ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        Console.WriteLine("[Startup] Applying database migrations...");
        context.Database.Migrate();
        Console.WriteLine("[Startup] Database migrations applied successfully!");
        
        // Ensure MachineName and FarmerName columns exist in Bookings table
        var connection = context.Database.GetDbConnection();
        await connection.OpenAsync();
        using (var command = connection.CreateCommand())
        {
            // Add MachineName column if missing
            command.CommandText = @"
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'MachineName')
                BEGIN
                    ALTER TABLE Bookings ADD MachineName NVARCHAR(MAX) NULL;
                    PRINT 'MachineName column added';
                END";
            await command.ExecuteNonQueryAsync();
            
            // Add FarmerName column if missing
            command.CommandText = @"
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'FarmerName')
                BEGIN
                    ALTER TABLE Bookings ADD FarmerName NVARCHAR(MAX) NULL;
                    PRINT 'FarmerName column added';
                END";
            await command.ExecuteNonQueryAsync();
            
            // Populate MachineName from Machines table
            command.CommandText = @"
                UPDATE b
                SET b.MachineName = m.Name
                FROM Bookings b
                INNER JOIN Machines m ON b.MachineId = m.Id
                WHERE b.MachineName IS NULL";
            await command.ExecuteNonQueryAsync();
            
            // Populate FarmerName from AspNetUsers table
            command.CommandText = @"
                UPDATE b
                SET b.FarmerName = u.FullName
                FROM Bookings b
                INNER JOIN AspNetUsers u ON b.FarmerId = u.Id
                WHERE b.FarmerName IS NULL";
            await command.ExecuteNonQueryAsync();
            
            Console.WriteLine("[Startup] Booking columns verified/populated.");
            
            // Ensure Payments table exists
            command.CommandText = @"
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Payments')
                BEGIN
                    CREATE TABLE Payments (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        BookingId INT NOT NULL,
                        RazorpayOrderId NVARCHAR(MAX) NOT NULL,
                        RazorpayPaymentId NVARCHAR(MAX) NOT NULL,
                        RazorpaySignature NVARCHAR(MAX) NOT NULL,
                        Amount DECIMAL(18,2) NOT NULL,
                        Currency NVARCHAR(MAX) NOT NULL DEFAULT 'INR',
                        Status NVARCHAR(MAX) NOT NULL DEFAULT 'Pending',
                        RefundAmount DECIMAL(18,2) NULL,
                        RefundId NVARCHAR(MAX) NULL,
                        RefundedAt DATETIME2 NULL,
                        RefundReason NVARCHAR(MAX) NULL,
                        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
                        CONSTRAINT FK_Payments_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE CASCADE
                    );
                    CREATE INDEX IX_Payments_BookingId ON Payments(BookingId);
                    PRINT 'Payments table created';
                END";
            await command.ExecuteNonQueryAsync();
            Console.WriteLine("[Startup] Payments table verified/created.");
            
            // Ensure Reviews table exists
            command.CommandText = @"
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Reviews')
                BEGIN
                    CREATE TABLE Reviews (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        BookingId INT NOT NULL,
                        MachineId INT NOT NULL,
                        MachineName NVARCHAR(100) NULL,
                        FarmerId NVARCHAR(450) NOT NULL,
                        FarmerName NVARCHAR(100) NULL,
                        OwnerId NVARCHAR(450) NOT NULL,
                        Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
                        Comment NVARCHAR(500) NULL,
                        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
                    );
                    CREATE UNIQUE INDEX IX_Reviews_BookingId_Unique ON Reviews(BookingId);
                    CREATE INDEX IX_Reviews_MachineId ON Reviews(MachineId);
                    CREATE INDEX IX_Reviews_FarmerId ON Reviews(FarmerId);
                    CREATE INDEX IX_Reviews_OwnerId ON Reviews(OwnerId);
                    CREATE INDEX IX_Reviews_CreatedAt ON Reviews(CreatedAt);
                    PRINT 'Reviews table created';
                END";
            await command.ExecuteNonQueryAsync();
            Console.WriteLine("[Startup] Reviews table verified/created.");
        }
        await connection.CloseAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Startup] Migration ERROR: {ex.Message}");
    }
}

// --- 9. MIDDLEWARE PIPELINE ---
// Security headers middleware - adds protective headers to all responses
app.UseSecurityHeaders();

// Exception handling middleware - must be early to catch all errors
app.UseExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Serve static files (uploaded images) with proper CORS and content types
app.UseStaticFiles(new StaticFileOptions
{
    ServeUnknownFileTypes = true,
    DefaultContentType = "application/octet-stream",
    OnPrepareResponse = ctx =>
    {
        // Add CORS headers for static files to prevent CORB
        var headers = ctx.Context.Response.Headers;
        headers.Append("Access-Control-Allow-Origin", "*");
        headers.Append("Access-Control-Allow-Methods", "GET, OPTIONS");
        headers.Append("Access-Control-Allow-Headers", "*");
        headers.Append("Cache-Control", "public, max-age=600");
        
        // Set correct content type for images to prevent CORB
        var fileName = ctx.File?.Name ?? "";
        var contentType = fileName switch
        {
            _ when fileName.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) => "image/jpeg",
            _ when fileName.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase) => "image/jpeg",
            _ when fileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase) => "image/png",
            _ when fileName.EndsWith(".gif", StringComparison.OrdinalIgnoreCase) => "image/gif",
            _ when fileName.EndsWith(".webp", StringComparison.OrdinalIgnoreCase) => "image/webp",
            _ => null
        };
        
        if (contentType != null)
            ctx.Context.Response.ContentType = contentType;
    }
});

app.UseCors("FarmEasePolicy");
app.UseRateLimiter();
app.UseResponseCompression();
app.UseOutputCache();
app.UseAuthentication();
app.UseAuthorization();

// --- 10. HEALTH CHECK ENDPOINTS ---
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = HealthCheckResponseWriter.WriteHealthCheckResponse
});
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});
app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false // No checks, just confirms app is running
});

// Health check UI dashboard
app.MapHealthChecksUI(options => options.UIPath = "/health-ui");

app.MapControllers();

app.Run();