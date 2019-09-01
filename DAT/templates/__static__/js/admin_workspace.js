import React from 'react';
import ReactDOM from 'react-dom';

import AdminWorkspace from "./materialui/adminworkspace-ui/adminws-main"
import Header from "./materialui/header";
import Footer from "./materialui/footer";

const header = document.getElementById("header");
header && ReactDOM.render(<Header />, header);

const admin_workspace = document.getElementById("admin_workspace");
admin_workspace && ReactDOM.render(<AdminWorkspace />, admin_workspace);

const footer = document.getElementById("footer");
footer && ReactDOM.render(<Footer />, footer);

