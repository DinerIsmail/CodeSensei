using System.Collections.Generic;

namespace CodeSensei.Interfaces
{
    public interface IRepository<T>
    {
        List<T> List();
    }
}
