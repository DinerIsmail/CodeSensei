using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using CodeSensei.Interfaces;
using CodeSensei.Models;
using Dapper;

namespace CodeSensei.Repositories
{
    public class ResourcesRepository : IResourcesRepository
    {
        private List<Resource> _data;
        public List<Resource> List() => Result();
        public List<Resource> Result()
        {
            if (_data != null) return _data;
            using (var conn = DatabaseConnection.CodeSensei)
            {
                _data = conn.Query<Resource>("SELECT * FROM [dbo].[Resource]").ToList();
            }

            return _data;
        }

        public Resource GetSingle(int entityId,int intentionId)
        {
            using (var conn = DatabaseConnection.CodeSensei)
            {
                return
                    conn.Query<Resource>(
                        "SELECT * FROM [dbo].[Resource] WHERE EntityId=@entityId and IntentionId=@intentionId",new {entityId,intentionId})
                        .ToList()
                        .Single();
            }
        }

        public void Save(Resource resource)
        {
            using (var conn = DatabaseConnection.CodeSensei)
            {
                var d = new DynamicParameters(new
                {
                    resource.EntityId,
                    resource.IntentionId,
                    resource.ResourceId,
                    resource.Link,
                    resource.Deleted
                });

                d.Add("ResourceId",resource.ResourceId,DbType.Int32,ParameterDirection.InputOutput);
                conn.Execute("Resource_Save", d, commandType: CommandType.StoredProcedure);
                resource.ResourceId = d.Get<int>("ResourceId");
            }
        }
    }
}