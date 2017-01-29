using System;
using System.Collections.Generic;
using System.Linq;
using CodeSensei.Interfaces;
using CodeSensei.Models;
using Dapper;

namespace CodeSensei.Repositories
{
    public class IntentionsRepository : IIntentionsRepository
    {
        private List<Intention> _data;
        public List<Intention> List() => Result();

        public List<Intention> Result()
        {
            if (_data != null) return _data;
            using (var conn = DatabaseConnection.CodeSensei)
            {
                _data = conn.Query<Intention>("SELECT * FROM [dbo].[Intention]").ToList();
            }
            return _data;
        }

        public void Save(Intention intention)
        {
            throw new NotImplementedException();
        }
    }
}