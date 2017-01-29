using System;

namespace CodeSensei.Models
{
    public class Resource
    {
        public int ResourceId { get; set; }

        public int EntityId { get; set; }

        public int IntentionId { get; set; }

        public string Link { get; set; }

        public DateTime DateAdded { get; set; }

        public bool Deleted { get; set; }
    }
}