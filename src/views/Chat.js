'use strict';

import React, {Component} from 'react';

export default class Chat extends Component {
    props = {
        chat: ""
    };
    state = {
        chatmessage: ""
    };
    render() {
        return <form className="chat" onSubmit={(e) => {e.preventDefault();this.props.onSubmit(this.state.chatmessage); this.setState({chatmessage: ""})}}>
            <input type="text" value={this.state.chatmessage} onChange={(e) => this.setState({chatmessage: e.target.value})}/><input type="submit" value="Envoi"/>
            <textarea value={this.props.chat} readOnly={true}/>
        </form>;
    }
}