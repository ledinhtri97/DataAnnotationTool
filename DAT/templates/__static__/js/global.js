import React from 'react';
import ReactDOM from 'react-dom';

import MenuAppBar from "./materialui/container";
import Footer from "./materialui/footer";

const containerapp = document.getElementById("containerapp");
containerapp && ReactDOM.render(<MenuAppBar />, containerapp);

const footer = document.getElementById("footer");
const labeling = document.getElementById("labeling");

setTimeout(function() {
	footer && !labeling && ReactDOM.render(<Footer />, footer);	
}, 500)
