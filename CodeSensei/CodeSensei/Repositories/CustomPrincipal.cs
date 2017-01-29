using System.Security.Principal;
using CodeSensei.Interfaces;

namespace CodeSensei.Repositories
{
    public class CustomPrincipal : ICustomPrincipal
    {
        public IIdentity Identity { get; }

        public bool IsInRole(string role)
        {
            return false;
        }

        public CustomPrincipal(string email)
        {
            Identity = new GenericIdentity(email);
        }

        public int Id { get; set; }
        public string FirstName { get; set; }
        public string Surname { get; set; }
    }
}