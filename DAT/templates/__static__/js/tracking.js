import React from 'react';
import ReactDOM from 'react-dom';
import {fabric} from 'fabric';

import MainFrameTracking from "./materialui/tracking-ui/mainframe";

document.addEventListener('contextmenu', event => event.preventDefault());

const labeling = document.getElementById("labeling");
// const on_edit = document.getElementById("on_edit");

labeling && ReactDOM.render(<MainFrameTracking />, labeling);