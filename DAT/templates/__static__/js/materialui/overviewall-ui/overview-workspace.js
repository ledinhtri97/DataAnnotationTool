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


import {
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend,
} from 'recharts';

const data = [
  {
    name: 'Page A', uv: 590, pv: 800, amt: 1400,
  },
  {
    name: 'Page B', uv: 868, pv: 967, amt: 1506,
  },
  {
    name: 'Page C', uv: 1397, pv: 1098, amt: 989,
  },
  {
    name: 'Page D', uv: 1480, pv: 1200, amt: 1228,
  },
  {
    name: 'Page E', uv: 1520, pv: 1108, amt: 1100,
  },
  {
    name: 'Page F', uv: 1400, pv: 680, amt: 1700,
  },
];

class ChartExample extends PureComponent {

  render() {
    return (
      <ComposedChart
        layout="vertical"
        width={500}
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
        <Area dataKey="amt" fill="#8884d8" stroke="#8884d8" />
        <Bar dataKey="pv" barSize={20} fill="#413ea0" />
        <Line dataKey="uv" stroke="#ff7300" />
      </ComposedChart>
    );
  }
}


const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
  },
  root2: {
    paddingTop: '5rem',
    width: '95%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },
  button: {
    margin: theme.spacing.unit,
    width: '15em',
  },
  listStatus: {
    display: 'flex',
  },
  chip: {
    margin: theme.spacing.unit,
    padding: 0,
    width: '5em',
  },
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
        </div>
        </div>
        <div>
          <Typography gutterBottom variant="h5" component="h2">
            Objects Count
          </Typography>
          <ChartExample />
        </div>
      </div>

      </div>

    );
  }
}

OverviewWorkspace.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(OverviewWorkspace);

