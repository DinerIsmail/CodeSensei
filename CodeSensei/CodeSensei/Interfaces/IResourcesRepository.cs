using CodeSensei.Models;

namespace CodeSensei.Interfaces
{
    public interface IResourcesRepository : IRepository<Resource>
    {
        void Save(Resource resource);
    }
}
