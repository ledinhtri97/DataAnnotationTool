import React from 'react';
import ReactDOM from 'react-dom';
import OverviewWorkspace from './materialui/overviewall-ui/overview-workspace';
import Header from "./materialui/header";
import Footer from "./materialui/footer";

const header = document.getElementById("header");
header && ReactDOM.render(<Header />, header);

const overview_workspace = document.getElementById("overview_workspace");
overview_workspace && ReactDOM.render(<OverviewWorkspace />, overview_workspace);

const footer = document.getElementById("footer");
footer && ReactDOM.render(<Footer />, footer);
