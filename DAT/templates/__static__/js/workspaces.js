import React from 'react';
import ReactDOM from 'react-dom';

import Workspaces from "./materialui/workspaces-ui"

const workspaces = document.getElementById("workspaces");
workspaces && ReactDOM.render(<Workspaces />, workspaces);



