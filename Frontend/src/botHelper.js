var Swagger = require('swagger-client');
var open = require('open');
var rp = require('request-promise');

// config items
var pollInterval = 1000;
var directLineSecret = 'zMibmo-hFsg.cwA.LZI.jVaFBVCEl5aBueVvvUZ983r7Knoh4T8h-VCJyW23eK0';
var directLineClientName = 'CodeSensei';
var directLineSpecUrl = 'https://docs.botframework.com/en-us/restapi/directline3/swagger.json';

export function setupDirectLine() {
  return rp(directLineSpecUrl)
      .then((spec) =>
          // client
          new Swagger(
              {
                  spec: JSON.parse(spec.trim()),
                  usePromise: true
              }))
      .then((client) => {
          client.clientAuthorizations.add('AuthorizationBotConnector', new Swagger.ApiKeyAuthorization('Authorization', 'Bearer ' + directLineSecret, 'header'));
          return client;
      })
      .catch((err) =>
          console.error('Error initializing DirectLine client', err));
}

export function postActivity(client, conversationId, message, entity, intent, diffLevel) {
  console.log(client, conversationId, message, entity, intent, diffLevel);

  return client.Conversations.Conversations_PostActivity(
      {
          conversationId: conversationId,
          activity: {
              textFormat: 'plain',
              text: entity + ',' + diffLevel + ',' + intent,
              type: 'message',
              from: {
                  id: directLineClientName,
                  name: directLineClientName
              }
          }
      }).catch((err) => console.error('Error sending message:', err));
}

export function pollMessages(client, conversationId) {
  console.log('Starting polling messages for conversationId: ' + conversationId);
  //var watermark = null;
  //setInterval(() => {
  return client.Conversations.Conversations_GetActivities({ conversationId: conversationId })
      .then((response) => {
          //watermark = response.obj.watermark;
          return response.obj.activities;
      });
  //}, 1000);
}
