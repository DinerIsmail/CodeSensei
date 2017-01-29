using System;

namespace CodeSensei.Models
{
    public class User
    {
        public int Id { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }

        public string FirstName { get; set; }

        public string Surname { get; set; }

        public DateTime? LastActivity { get; set; }
    }
}