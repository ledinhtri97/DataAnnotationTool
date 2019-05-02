import React from 'react';
import ReactDOM from 'react-dom';
import OverviewAll from './materialui/overviewall-ui/overviewall-main';
import OverviewWorkspace from './materialui/overviewall-ui/overview-workspace';

const overviewall = document.getElementById("overviewall");
overviewall && ReactDOM.render(<OverviewAll />, overviewall);

const overview_workspace = document.getElementById("overview_workspace");
overview_workspace && ReactDOM.render(<OverviewWorkspace />, overview_workspace);
