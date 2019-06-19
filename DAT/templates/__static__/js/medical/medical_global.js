import React from 'react';
import ReactDOM from 'react-dom';

import MedicalMenuBar from "./medical_menu_bar";
import Footer from "../materialui/footer";

const containerapp = document.getElementById("containerapp");
containerapp && ReactDOM.render(<MedicalMenuBar />, containerapp);

const footer = document.getElementById("footer");
const labeling = document.getElementById("labeling");

setTimeout(function() {
	footer && !labeling && ReactDOM.render(<Footer />, footer);	
}, 1500)
