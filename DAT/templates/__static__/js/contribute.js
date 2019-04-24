import React from 'react';
import ReactDOM from 'react-dom';

import Contribute from './materialui/contribute-ui/main';

const contribute = document.getElementById("contribute");
contribute && ReactDOM.render(<Contribute />, contribute);