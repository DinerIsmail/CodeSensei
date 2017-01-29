import React from 'react';
import { Button } from 'react-bootstrap';
import classnames from 'classnames';

import * as Chat from '../chat.js';
import * as Bot from '../botHelper.js';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allMessages: [{
        mine: false,
        text: "Welcome to Code Sensei! How can I help you?"
      }],
      message: "",
      client: null,
      contextId: null,
      directLineClient: null,
      conversationId: null,
      entity: null,
      intent: null,
      diffLevel: null,
      order: 1,
      notUnderstoodCount: 0,
      currentResource: null
    }
  }

  addMessageToState(isSensei, text) {
    let updatedMessages = this.state.allMessages;

    if (isSensei == true) {
      setTimeout(() => {
        updatedMessages.push({
          mine: !isSensei,
          text: text
        })

        this.setState({
          allMessages: updatedMessages
        });
      }, 1000);
    } else {
      updatedMessages.push({
        mine: !isSensei,
        text: text
      })

      this.setState({
        allMessages: updatedMessages
      });
    }
  }

  updateMessage(ev) {
    this.setState({ message: ev.target.value });
  }

  handleSubmit(ev) {
    ev.preventDefault();
    var that = this;

    if (this.state.message == "") {
      return;
    }

    Chat.sendMessage(this.state.message, this.state.contextId)
      .then((response) => {
        let responseObj = JSON.parse(response);
        let intent = responseObj.topScoringIntent.intent;
        let entity = "";
        let diffLevel = "";

        this.addMessageToState(false, this.state.message);

        if (intent == "None") {
          if (this.state.notUnderstoodCount >= 2) {
            this.addMessageToState(true, "Sorry, I don't understand what you're saying. I only know how to teach coding :)");
          } else {
            this.addMessageToState(true, "Please ask me coding-related questions. I don't have time for unimportant issues.");
          }
          nthis.state.notUnderstoodCount++;
        } else if (intent == "learn") {
          let status = responseObj.dialog.status;

          this.setState({intent: "learn"});

          if (status == "Question") {
            let replyText = responseObj.dialog.prompt;
            this.setState({ contextId: responseObj.dialog.contextId });

            this.addMessageToState(true, replyText);
          } else if (status == "Finished") {
            let that = this;
            let entity = "";
            let diffLevel = "";

            if (responseObj.topScoringIntent.actions[0].parameters[0].name) {
              entity = responseObj.topScoringIntent.actions[0].parameters[0].value[0].entity;
              this.setState({ entity: entity });
            }

            if (responseObj.topScoringIntent.actions[0].parameters[1].name) {
              diffLevel = responseObj.topScoringIntent.actions[0].parameters[1].value[0].entity;
              this.setState({ diffLevel: diffLevel });
            }

            Bot.setupDirectLine()
              .then((client) => {
                this.setState({ client: client });

                client.Conversations.Conversations_StartConversation()
                    .then((response) => response.obj.conversationId)
                    .then((conversationId) => {
                        //console.log(conversationId);
                        that.setState({ directLineClient: client, conversationId: conversationId });

                        Bot.postActivity(client, conversationId, this.state.message, entity, intent, diffLevel)
                          .then((response) => {
                            //console.log(response);
                          });

                        setTimeout(() => {
                          Bot.pollMessages(client, conversationId)
                            .then((activities) => {
                              console.log(activities);
                              if (activities.length > 1) {

                                that.setState({ currentResource: activities[activities.length-1].text })

                                if (activities[activities.length-1].text.includes("https")) {
                                  this.addMessageToState(true, "Here, watch this video.");
                                } else {
                                  this.addMessageToState(true, "Please read the lesson, then click Continue");
                                }
                              }
                            });
                        }, 2000);
                    })
              });

          }

        }

        this.setState({
          message: ""
        });

        //console.log(response);
      });
  }

  renderResource(resource) {
    if (resource.includes("https")) {
      return (
        <div className="video">
          <iframe style={{position: 'absolute', width: '100%', height: '80%', border: 'none'}} src={resource} frameBorder="0" allowFullScreen></iframe>
        </div>
      )
    } else {
      return (
        <div>
          <div className="text_content">{resource}</div>
        </div>
      )
    }
  }

  handleContinue(ev) {
    ev.preventDefault();
    let that = this;

    let orderIncremented = ++this.state.order || 2;
    this.setState({ order: orderIncremented });
    Bot.postActivity(this.state.client, this.state.conversationId, this.state.message, this.state.entity, this.state.intent, this.state.diffLevel, orderIncremented);

    setTimeout(() => {
      Bot.pollMessages(this.state.client, this.state.conversationId)
        .then((activities) => {
          console.log(activities);
          if (activities.length > 1) {

            that.setState({ currentResource: activities[activities.length-1].text })

            if (activities[activities.length-1].text.includes("youtube")) {
              that.addMessageToState(true, "Here, watch this video.");
            } else {
              that.addMessageToState(true, "Please read the lesson, then click Continue");
            }
          }
        });
    }, 1500);
  }

  render() {
    return (
      <div>
        <div className="chat_window">
          <div className="top_menu">
            <div className="title">Code Sensei</div>
          </div>

          <ul className="messages">
            {this.state.allMessages.map((message, i) => {
              let messageItemClasses = [
                "message",
                "appeared",
                message.mine == true ? "right" : "left"
              ];

              return (
                <li className={classnames(messageItemClasses)} key={i}>
                  <div className="avatar">
                    {message.mine ? (<img className="avatar_image" src="https://www.shareicon.net/data/512x512/2016/06/30/788940_people_512x512.png" />) : (<img className="avatar_image" src="https://cdn4.iconfinder.com/data/icons/samurai/512/Elderly-512.png" />)}
                  </div>
                  <div className="text_wrapper">
                    <div className="text">{message.text}</div>
                  </div>
                </li>
              )
            })}

          </ul>

          <div className="bottom_wrapper clearfix">
            <div className="message_input_wrapper">
              <input className="message_input" onChange={(ev) => this.updateMessage(ev)} value={this.state.message} placeholder="Type your message here..."/>
            </div>

            <div className="send_message">
              <div className="icon"></div>
              <div className="text" onClick={(ev) => this.handleSubmit(ev)}>Send</div>
            </div>
          </div>
        </div>

        <div className="message_template">
          <li className="message">
            <div className="avatar"></div>
              <div className="text_wrapper">
                <div className="text"></div>
              </div>
          </li>
        </div>

        <div className="content_area">
          {
            (this.state.currentResource != null) ? this.renderResource(this.state.currentResource) : (<h2 className="instructions">First talk to sensei in the chat area on the left :)</h2>)
          }
        </div>

        <div className="actions_area">
          {
            (this.state.currentResource != null) ? (<button className="continue_button"><div className="text" onClick={(ev) => this.handleContinue(ev)}>Continue</div></button>) : <div></div>
          }
        </div>

      </div>);
  }
}

export default Home;
