'use strict';
require("es6-shim");

import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import Tarot from '../views/Tarot'
import DocumentTitle from 'react-document-title'


ReactDOM.render(<DocumentTitle title="Tarot en ligne"><Tarot/></DocumentTitle>, document.getElementById('content'));
