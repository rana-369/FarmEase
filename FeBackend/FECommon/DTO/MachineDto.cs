namespace FEDTO.DTOs
{
    public class MachineDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Rate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string OwnerId { get; set; } = string.Empty;
    }

    public class CreateMachineDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Rate { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }
}
