# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution files
COPY ["FarmEase/FarmEase.csproj", "FarmEase/"]
COPY ["FEServices/FEServices.csproj", "FEServices/"]
COPY ["FECommon/FECommon.csproj", "FECommon/"]
COPY ["FEDomain/FEDomain.csproj", "FEDomain/"]
COPY ["FERepositories/FERepositories.csproj", "FERepositories/"]

# Restore dependencies
RUN dotnet restore "FarmEase/FarmEase.csproj"

# Copy source code
COPY . .

# Build application
WORKDIR /src/FarmEase
RUN dotnet build "FarmEase.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "FarmEase.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install healthcheck dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser

# Create directories for uploads and logs
RUN mkdir -p /app/wwwroot/uploads/equipment /app/logs && chown -R appuser:appuser /app

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true

# Copy published application
COPY --from=publish /app/publish .

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "FarmEase.dll"]
