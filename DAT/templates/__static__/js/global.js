import React from 'react';
import ReactDOM from 'react-dom';

import MenuAppBar from "./materialui/container";

const containerapp = document.getElementById("containerapp");
containerapp && ReactDOM.render(<MenuAppBar />, containerapp);