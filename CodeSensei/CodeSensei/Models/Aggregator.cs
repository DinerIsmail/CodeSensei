using CodeSensei.Interfaces;
using CodeSensei.Repositories;

namespace CodeSensei.Models
{
    public class Aggregator : IAggregator
    {
        public Aggregator()
        {
            UserRepository = new UserRepository();
        }

        public IUserRepository UserRepository { get; set; }
    }
}