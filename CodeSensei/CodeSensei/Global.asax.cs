using System;
using System.Web;
using System.Web.Http;
using System.Web.Routing;
using System.Web.Script.Serialization;
using System.Web.Security;
using CodeSensei.Models;
using CodeSensei.Repositories;

namespace CodeSensei
{
    public class WebApiApplication : HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
        }
        protected void Application_PostAuthenticateRequest(object sender, EventArgs e)
        {
            var authCookie = Request.Cookies[FormsAuthentication.FormsCookieName];

            if (authCookie?.Value == null) return;
            var authTicket = FormsAuthentication.Decrypt(authCookie.Value);

            var serializer = new JavaScriptSerializer();

            if (authTicket == null) return;
            var serializeModel = serializer.Deserialize<CustomPrincipalSerializeModel>(authTicket.UserData);

            var newUser = new CustomPrincipal(authTicket?.Name)
            {
                Id = serializeModel.Id,
                FirstName = serializeModel.FirstName,
                Surname = serializeModel.Surname
            };

            HttpContext.Current.User = newUser;
        }
    }
}
