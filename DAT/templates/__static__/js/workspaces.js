import React from 'react';
import ReactDOM from 'react-dom';
import Workspaces from "./materialui/workspaces-ui";
import Header from "./materialui/header";
import Footer from "./materialui/footer";

const header = document.getElementById("header");
header && ReactDOM.render(<Header />, header);

const workspaces = document.getElementById("workspaces");
workspaces && ReactDOM.render(<Workspaces />, workspaces);

const footer = document.getElementById("footer");
footer && ReactDOM.render(<Footer />, footer);