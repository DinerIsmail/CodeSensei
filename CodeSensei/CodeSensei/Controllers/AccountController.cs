using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using System.Web.Security;
using CodeSensei.Interfaces;
using CodeSensei.Models;

namespace CodeSensei.Controllers
{
    public class AccountController : Controller
    {
        private static IAggregator _aggregator;

        public AccountController()
        {
            _aggregator = new Aggregator();
        }

        public HttpStatusCodeResult Login(string email, string password)
        {
            if (!_aggregator.UserRepository.List().Any(x => x.Email == email && x.Password == password)) return new HttpStatusCodeResult(500);
            var user = _aggregator.UserRepository.List().First(u => u.Email == email);

            var serializeModel = new CustomPrincipalSerializeModel
            {
                Id = user.Id,
                FirstName = user.FirstName,
                Surname = user.Surname
            };

            var serializer = new JavaScriptSerializer();

            var userData = serializer.Serialize(serializeModel);

            var authTicket = new FormsAuthenticationTicket(
                1,
                email,
                DateTime.Now,
                DateTime.Now.AddMinutes(15),
                false,
                userData);

            var encTicket = FormsAuthentication.Encrypt(authTicket);
            var faCookie = new HttpCookie(FormsAuthentication.FormsCookieName, encTicket);
            Response.Cookies.Add(faCookie);

            return new HttpStatusCodeResult(200);
        }

        public HttpStatusCodeResult Logout()
        {
            _aggregator.UserRepository.LogoutUser();
            return new HttpStatusCodeResult(200);
        }
    }
}