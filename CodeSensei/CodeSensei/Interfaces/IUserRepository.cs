using CodeSensei.Models;

namespace CodeSensei.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        void Save(User user);
        void LogoutUser();
    }
}
