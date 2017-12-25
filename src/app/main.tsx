'use strict';
import "es6-shim";

import * as React from 'react'
import {render} from 'react-dom'
import Tarot from '../views/Tarot'
import * as DocumentTitle from 'react-document-title'


render(<DocumentTitle title="Tarot en ligne"><Tarot/></DocumentTitle>, document.getElementById('content'));
