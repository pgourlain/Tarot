'use strict';

import * as React from 'react';
import {Component} from 'react';
import * as emojiLib from 'emoji';

export interface EmojiProps {
    emoji?: string
}

export default class Emoji extends Component<EmojiProps> {
    render() {
        if (!this.props.emoji) {
            return <span/>;
        } else {
            return <span dangerouslySetInnerHTML={{__html: emojiLib.unifiedToHTML(this.props.emoji)}}></span>
        }
    }
}
