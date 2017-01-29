using System.Collections.Generic;
using System.Linq;
using CodeSensei.Interfaces;
using CodeSensei.Models;
using Dapper;

namespace CodeSensei.Repositories
{
    public class DifficultyLevelsRepository : IDifficultyLevelsRepository
    {
        private List<DifficultyLevel> _data;
        public List<DifficultyLevel> List() => Result();

        public List<DifficultyLevel> Result()
        {
            if (_data != null) return _data;

            using (var conn = DatabaseConnection.CodeSensei)
            {
                _data = conn.Query<DifficultyLevel>("SELECT * FROM [dbo].[DifficultyLevel]").ToList();
            }


            return _data;
        }
    }
}