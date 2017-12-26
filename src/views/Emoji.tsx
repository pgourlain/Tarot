import * as emojiLib from 'emoji';
import * as React from 'react';
import {Component} from 'react';

export interface IEmojiProps {
    emoji?: string;
}

export default class Emoji extends Component<IEmojiProps> {
    public render() {
        if (!this.props.emoji) {
            return <span/>;
        } else {
            return <span dangerouslySetInnerHTML={{__html: emojiLib.unifiedToHTML(this.props.emoji)}}></span>;
        }
    }
}
