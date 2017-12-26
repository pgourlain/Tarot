import 'es6-shim';

import * as React from 'react';
import * as DocumentTitle from 'react-document-title';
import {render} from 'react-dom';
import Tarot from '../views/Tarot';

render(
    <DocumentTitle title="Tarot en ligne">
        <Tarot/>
    </DocumentTitle>
    , document.getElementById('content'));
