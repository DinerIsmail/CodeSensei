using System.Data;
using System.Data.SqlClient;

namespace CodeSensei.Models
{
    public static class DatabaseConnection
    {
        public static IDbConnection CodeSensei => new SqlConnection("Server=codesensei.database.windows.net;Database=CodeSenseiDB;User Id=codesensei;Password=greenpark2017!;Application Name=CodeSensei");
    }
}