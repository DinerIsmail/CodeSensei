using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.Security;
using CodeSensei.Interfaces;
using CodeSensei.Models;
using Dapper;

namespace CodeSensei.Repositories
{
    public class UserRepository : IUserRepository
    {
        private List<User> _data;
        public List<User> List() => Result();

        public List<User> Result()
        {
            if (_data != null) return _data;
            using (var conn = DatabaseConnection.CodeSensei)
            {
                _data = conn.Query<User>("SELECT * FROM [dbo].[User]").ToList();
            }

            return _data;
        }

        public void Save(User user)
        {
            using (var conn = DatabaseConnection.CodeSensei)
            {
                var d = new DynamicParameters(new
                {
                    user.Email,
                    user.Password,
                    user.FirstName,
                    user.Surname,
                    user.LastActivity
                });

                d.Add("Id",user.Id,DbType.Int32,ParameterDirection.InputOutput);
                conn.Execute("User_Save", d, commandType: CommandType.StoredProcedure);
                user.Id = d.Get<int>("Id");
            }
        }

        public void LogoutUser()
        {
            FormsAuthentication.SignOut();
        }
    }
}