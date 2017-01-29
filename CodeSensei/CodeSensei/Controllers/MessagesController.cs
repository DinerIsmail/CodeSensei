using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using CodeSensei.Interfaces;
using CodeSensei.Models;
using Microsoft.Bot.Connector;

namespace CodeSensei.Controllers
{
    public class MessagesController : ApiController
    {
        private readonly IAggregator _aggregator;

        public MessagesController()
        {
            _aggregator = new Aggregator();
        }

        /// <summary>
        ///     POST: api/Messages
        ///     Receive a message from a user and reply to it
        /// </summary>
        public async Task<HttpResponseMessage> Post([FromBody] Activity activity)
        {
            if (activity.Type == ActivityTypes.Message)
            {
                var connector = new ConnectorClient(new Uri(activity.ServiceUrl));
                // calculate something for us to return
                var linkResult = GetLink(activity.Text.Split(',')[0], activity.Text.Split(',')[1]);
                if (string.IsNullOrEmpty(linkResult))
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest);
                }

                // return our reply to the user
                var reply = activity.CreateReply(linkResult);
                await connector.Conversations.ReplyToActivityAsync(reply);
            }
            else
            {
                HandleSystemMessage(activity);
            }
            var response = Request.CreateResponse(HttpStatusCode.OK);
            return response;
        }

        private Activity HandleSystemMessage(Activity message)
        {
            switch (message.Type)
            {
                case ActivityTypes.DeleteUserData:
                    _aggregator.UserRepository.LogoutUser();
                    return new Activity("User session deleted!");
                case ActivityTypes.ConversationUpdate:
                    return new Activity("A user has been added to the conversation!");
                // Handle conversation state changes, like members being added and removed
                // Use Activity.MembersAdded and Activity.MembersRemoved and Activity.Action for info
                // Not available in all channels
                case ActivityTypes.ContactRelationUpdate:
                    // Handle add/remove from contact lists
                    // Activity.From + Activity.Action represent what happened
                    break;
                case ActivityTypes.Typing:
                    return new Activity("User is typing...");
                case ActivityTypes.Ping:
                    break;
            }

            return null;
        }

        private string GetLink(string entity, string intent)
        {
            if (string.IsNullOrEmpty(entity) || string.IsNullOrEmpty(intent)) return "";
            var entityId = _aggregator.EntitiesRepository.List()
                .Single(x => string.Equals(x.Description, entity, StringComparison.CurrentCultureIgnoreCase)).Id;
            var intentId =
                _aggregator.IntentionsRepository.List()
                    .Single(x => string.Equals(x.Description, intent, StringComparison.CurrentCultureIgnoreCase))
                    .Id;
            return
                _aggregator.ResourcesRepository.List()
                    .Single(x => x.EntityId == entityId && x.IntentionId == intentId)
                    .Link;
        }
    }
}