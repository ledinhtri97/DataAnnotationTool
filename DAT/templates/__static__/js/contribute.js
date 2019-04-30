import React from 'react';
import ReactDOM from 'react-dom';

import Contribute from './materialui/contribute-ui/contribute-main';
import ContributeItemsGrid from './materialui/contribute-ui/contribute-view/contribute-items';

const contribute = document.getElementById("contribute");
contribute && ReactDOM.render(<Contribute />, contribute);

const contribute_items = document.getElementById("contribute_items");
contribute_items && ReactDOM.render(<ContributeItemsGrid />, contribute_items);