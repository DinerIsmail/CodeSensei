using CodeSensei.Models;

namespace CodeSensei.Interfaces
{
    public interface IEntitiesRepository : IRepository<Entity>
    {
        void Save(Entity entity);
    }
}
