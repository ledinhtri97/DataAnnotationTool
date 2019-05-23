import React from 'react';
import ReactDOM from 'react-dom';

import MedicalMenuAppBar from "./materialui/medical_container";
import Footer from "./materialui/footer";

const containerapp = document.getElementById("containerapp");
containerapp && ReactDOM.render(<MedicalMenuAppBar />, containerapp);

const footer = document.getElementById("footer");
const labeling = document.getElementById("labeling");

setTimeout(function() {
	footer && !labeling && ReactDOM.render(<Footer />, footer);	
}, 1500)
