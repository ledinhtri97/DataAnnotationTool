import React from 'react';
import ReactDOM from 'react-dom';

import AdminWorkspace from "./materialui/adminworkspace-ui/adminws-main"

const admin_workspace = document.getElementById("admin_workspace");
setTimeout(function() {
	admin_workspace && ReactDOM.render(<AdminWorkspace />, admin_workspace);
	}, 500
);