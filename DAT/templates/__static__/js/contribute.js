import React from 'react';
import ReactDOM from 'react-dom';

import Contribute from './materialui/contribute-ui/contribute-main';

const contribute = document.getElementById("contribute");
contribute && ReactDOM.render(<Contribute />, contribute);