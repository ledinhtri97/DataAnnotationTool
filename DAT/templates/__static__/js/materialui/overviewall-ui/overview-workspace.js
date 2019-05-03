import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Loyalty from '@material-ui/icons/Loyalty';
import Done from '@material-ui/icons/Done';

import TabShowLabels from './tabshow-labels';

import {
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend,
} from 'recharts';

const data = [
  {
    "name": 'Label A', "total": 590, "user": 800, "predict": 1400,
  },
  {
    "name": 'Label B', "total": 868, "user": 967, "predict": 1506,
  },
  {
    "name": 'Label C', "total": 1397, "user": 1098, "predict": 989,
  },
  {
    "name": 'Label D', "total": 1480, "user": 1200, "predict": 1228,
  },
  {
    "name": 'Label E', "total": 1520, "user": 1108, "predict": 1100,
  },
  {
    "name": 'Label F', "total": 1400, "user": 680, "predict": 1700,
  },
];

class ChartExample extends PureComponent {

  render() {
    return (
      <ComposedChart
        layout="vertical"
        width={600}
        height={400}
        data={data}
        margin={{
          top: 20, right: 20, bottom: 20, left: 20,
        }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" />
        <Tooltip />
        <Legend />
        <Area dataKey="total" fill="#8884d8" stroke="#8884d8" />
        <Bar dataKey="user" barSize={20} fill="#413ea0" />
        <Line dataKey="predict" stroke="#ff7300" />
      </ComposedChart>
    );
  }
}


const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    paddingTop: '4.5rem',
  },
  root2: {
    width: '95%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    marginLeft: '1em'
  },
  button: {
    margin: theme.spacing.unit,
    width: '14em',
  },
  listStatus: {
    display: 'flex',
  },
  chip: {
    margin: theme.spacing.unit,
    padding: 0,
    width: '5em',
  },
  extractButton: {
    margin: theme.spacing.unit,
    width: '20em',
    float: 'right',
    marginRight: '2rem',
  },
  tableLabels: {
    width: '80%',
  }
});

class OverviewWorkspace extends React.Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    const { classes, theme } = this.props;
    
    return (
      <div className={classes.root}>
      <Button variant="outlined" color="primary" className={classes.extractButton}>
          Extract Report To Admin
      </Button>
      <div className={classes.root2}>
        
        <div>
          <div>
            <Typography gutterBottom variant="h5" component="h2">
            Total Progress
            </Typography>
          </div>

          <div>
            <div className={classes.listStatus}>
            <Button variant="outlined" color="primary" className={classes.button}>
              Submitted
            </Button>
            <Chip label="10" className={classes.chip}/>
            </div>
            <div className={classes.listStatus}>
            <Button variant="outlined" color="primary" className={classes.button}>
              Remaining
            </Button>
            <Chip label="4" className={classes.chip}/>
            </div>
            <div className={classes.listStatus}>
            <Button variant="outlined" color="primary" className={classes.button}>
              Skipped
            </Button>
            <Chip label="10" className={classes.chip}/>
            </div>
            <div className={classes.listStatus}>
            <Button variant="outlined" color="primary" className={classes.button}>
              Complete 
            </Button>
            <Chip label="30%" className={classes.chip}/>
            </div>
          </div>
        </div>

        <div>
          <div>
            <Typography gutterBottom variant="h5" component="h2">
            Your Progress
            </Typography>
          </div>
          <div>
            <div className={classes.listStatus}>
            <Button variant="outlined" color="primary" className={classes.button}>
              Submitted
            </Button>
            <Chip label="6" className={classes.chip}/>
            </div>
            
            <div className={classes.listStatus}>
            <Button variant="outlined" color="primary" className={classes.button}>
              Available
            </Button>
            <Chip label="4" className={classes.chip}/>
            </div>

            <div className={classes.listStatus}>
            <Button variant="outlined" color="primary" className={classes.button}>
              Skipped
            </Button>
            <Chip label="2" className={classes.chip}/>
            </div>

            <div className={classes.listStatus}>
            <Button variant="outlined" color="primary" className={classes.button}>
              Labels Created
            </Button>
            <Chip label="10" className={classes.chip}/>
            </div>

            <div className={classes.listStatus}>
            <Button variant="outlined" color="primary" className={classes.button}>
              Flag false predict
            </Button>
            <Chip icon={<Loyalty color='secondary'/>} label="10" className={classes.chip}/>
            <Chip icon={<Done color='primary'/>} label="10" className={classes.chip}/>
            </div>

        </div>
        </div>
        <div>
          <Typography gutterBottom variant="h5" component="h2">
            Objects Count
          </Typography>
          <ChartExample />
        </div>
      </div>

      <TabShowLabels />

      </div>

    );
  }
}

OverviewWorkspace.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(OverviewWorkspace);

