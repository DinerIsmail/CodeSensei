using System.Security.Principal;

namespace CodeSensei.Interfaces
{
    internal interface ICustomPrincipal : IPrincipal
    {
        int Id { get; set; }
        string FirstName { get; set; }
        string Surname { get; set; }
    }
}
