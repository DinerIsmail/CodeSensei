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
      contextId: null,
      directLineClient: null,
      conversationId: null
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
          this.addMessageToState(true, "Sorry, I don't understand what you're saying. I only know how to teach coding :)");
        } else if (intent == "learn") {
          let status = responseObj.dialog.status;

          if (status == "Question") {
            let replyText = responseObj.dialog.prompt;
            this.setState({ contextId: responseObj.dialog.contextId });

            this.addMessageToState(true, replyText);
          } else if (status == "Finished") {
            let that = this;
            let entity = "javascript";
            let diffLevel = "basic";

            if (responseObj.topScoringIntent.actions[0].parameters[0].name.programmingLanguage) {
              entity = responseObj.topScoringIntent.actions[0].parameters[0].value[0].entity;
            }

            if (responseObj.topScoringIntent.actions[0].parameters[1].name.difficultyLevel) {
              diffLevel = responseObj.topScoringIntent.actions[0].parameters[1].value[0].entity;
            }

            setTimeout(() => {
              Bot.setupDirectLine()
                .then((client) => {
                  client.Conversations.Conversations_StartConversation()
                      .then((response) => response.obj.conversationId)
                      .then((conversationId) => {
                          console.log(conversationId);
                          that.setState({ directLineClient: client, conversationId: conversationId });

                          //console.log(client, conversationId, this.state.message, entity, intent, diffLevel);
                          Bot.postActivity(client, conversationId, this.state.message, entity, intent, diffLevel)
                            .then((response) => {
                              console.log(response);
                            });

                          setInterval(() => {
                            Bot.pollMessages(client, conversationId)
                              .then((activities) => {
                                console.log(activities);
                              });
                          }, 20000);
                      })
                });
            }, 1000);

          }

        }

        this.setState({
          message: ""
        });

        console.log(response);
      });
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
                    {message.mine ? (<img className="avatar_image" src="https://www.shareicon.net/data/512x512/2016/06/30/788940_people_512x512.png" />) : (<h2>CS</h2>)}
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
          <div className="video">
            <iframe style={{position: 'absolute', width: '100%', height: '80%', border: 'none'}} src="https://www.youtube.com/embed/ZzVxgJmLAsE" frameBorder="0" allowFullScreen></iframe>
          </div>
        </div>
      </div>);
  }
}

export default Home;
