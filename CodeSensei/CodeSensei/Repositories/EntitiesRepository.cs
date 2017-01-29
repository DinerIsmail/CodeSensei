using System;
using System.Collections.Generic;
using System.Linq;
using CodeSensei.Interfaces;
using CodeSensei.Models;
using Dapper;

namespace CodeSensei.Repositories
{
    public class EntitiesRepository : IEntitiesRepository
    {
        private List<Entity> _data;
        public List<Entity> List() => Result();

        public List<Entity> Result()
        {
            if (_data != null) return _data;
            using (var conn = DatabaseConnection.CodeSensei)
            {
                _data = conn.Query<Entity>("SELECT * FROM [dbo].[Entity]").ToList();
            }

            return _data;
        }

        public void Save(Entity entity)
        {
            throw new NotImplementedException();
        }
    }
}