import React from 'react';
import ReactDOM from 'react-dom';

import MenuAppBar from "./materialui/container";
import Workspaces from "./materialui/workspaces"
import MainProject from "./materialui/project";
import MainBoard from "./materialui/mainboard";
import TemporaryDrawerInstruction from "./materialui/drawerInstruction";
import TemporaryDrawerSettings from "./materialui/drawerSettings";

const containerapp = document.getElementById("containerapp");
containerapp && ReactDOM.render(<MenuAppBar />, containerapp);

const workspaces = document.getElementById("workspaces");
workspaces && ReactDOM.render(<Workspaces />, workspaces);

const project = document.getElementById("project");
project && ReactDOM.render(<MainProject />, project);

const mainboard = document.getElementById("mainboard");
mainboard && ReactDOM.render(<MainBoard />, mainboard);

const keyboard = document.getElementById("keyboard");
keyboard && ReactDOM.render(<TemporaryDrawerInstruction />, keyboard);

const settings = document.getElementById("settings");
settings && ReactDOM.render(<TemporaryDrawerSettings />, settings);
