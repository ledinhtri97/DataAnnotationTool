import React from 'react';
import ReactDOM from 'react-dom';

import MenuAppBar from "./materialui/navbar";
import Workspaces from "./materialui/workspaces"
import MainAppContainer from "./materialui/container";

const navbar = document.getElementById("navbar");
navbar && ReactDOM.render(<MenuAppBar />, navbar);

const workspaces = document.getElementById("workspaces");
workspaces && ReactDOM.render(<Workspaces />, workspaces);

//https://webpack.js.org/guides/code-splitting/
//https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/page-layout-examples/dashboard/Dashboard.js
//https://material-ui.com/getting-started/page-layout-examples/dashboard/
//https://material.io/design/navigation/understanding-navigation.html#reverse-navigation
//https://datastudio.google.com/u/0/reporting/0B_U5RNpwhcE6QXg4SXFBVGUwMjg/page/6zXD/preview?_ga=2.168898466.2047146151.1555173982-572470815.1554052315
//https://app.labelbox.com/projects/cjpntm2f3vaay0873hrkcui7r/overview
//