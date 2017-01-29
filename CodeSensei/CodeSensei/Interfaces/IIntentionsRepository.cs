using CodeSensei.Models;

namespace CodeSensei.Interfaces
{
    public interface IIntentionsRepository : IRepository<Intention>
    {
        void Save(Intention intention);
    }
}
