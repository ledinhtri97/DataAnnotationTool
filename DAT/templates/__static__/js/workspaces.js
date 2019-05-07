import React from 'react';
import ReactDOM from 'react-dom';

import Workspaces from "./materialui/workspaces"

const workspaces = document.getElementById("workspaces");
setTimeout(function() {
	workspaces && ReactDOM.render(<Workspaces />, workspaces);
	}, 500
);



