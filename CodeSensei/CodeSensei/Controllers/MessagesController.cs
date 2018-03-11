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
        ///     Receive a user message and reply to it
        /// </summary>
        public async Task<HttpResponseMessage> Post([FromBody] Activity activity)
        {
            if (activity.Type == ActivityTypes.Message)
            {
                var connector = new ConnectorClient(new Uri(activity.ServiceUrl));


                // calculate something for us to return
                var resource = GetLink(activity);
                if (resource == null)
                    throw new NoMatchingResourceException("The particular resource could not be found!");

                // return our reply to the user
                var reply = activity.CreateReply(resource.Link, resource.Order.ToString());
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

        /// <summary>
        ///     Handles Activity response message
        /// </summary>
        /// <param name="activity"></param>
        /// <returns></returns>
        private Resource GetLink(Activity activity)
        {
            var obj = activity?.Text?.Split(',').Length > 0 ? activity.Text.Split(',') : null;
            if (obj == null) return null;

            var entity = obj[0];
            var diffLevel = obj[1];
            var intent = obj[2];
            var order = "";


            if (obj.Length > 3)
            {
                order = obj[3];
            }
            

            if (string.IsNullOrEmpty(entity) || string.IsNullOrEmpty(intent)) return null;
            var entityId = _aggregator.EntitiesRepository.List()
                .SingleOrDefault(x => string.Equals(x.Description, entity, StringComparison.CurrentCultureIgnoreCase))?
                .Id;

            var difficultyLevel =
                _aggregator.DifficultyLevelsRepository.List()
                    .SingleOrDefault(
                        x => string.Equals(x.Description, diffLevel, StringComparison.CurrentCultureIgnoreCase))?
                    .Id;
            var intentId =
                _aggregator.IntentionsRepository.List()
                    .SingleOrDefault(
                        x => string.Equals(x.Description, intent, StringComparison.CurrentCultureIgnoreCase))?
                    .Id;

            if (string.IsNullOrEmpty(order))
            {
                return
                    _aggregator.ResourcesRepository.List()
                        .SingleOrDefault(
                            x =>
                                x.EntityId == entityId && x.IntentionId == intentId &&
                                x.DifficultyLevelId == difficultyLevel && x.Order == 1);
            }

            return
                _aggregator.ResourcesRepository.List()
                    .SingleOrDefault(
                        x =>
                            x.EntityId == entityId && x.IntentionId == intentId &&
                            x.DifficultyLevelId == difficultyLevel && x.Order == Convert.ToInt32(order));
        }
    }
}