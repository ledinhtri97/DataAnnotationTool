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

import ProgressesTable from './table/table-progress';

import TabShowLabels from './tabshow-labels';

import {
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend,
} from 'recharts';

class ChartObjectsCount extends PureComponent {

  constructor(props){
    super(props);
    this.state = {
      }
  };

  componentDidMount(){
    //this.getData();
  };

  render() {

    const {objects} = this.props;

    return (
      <ComposedChart
        layout="vertical"
        width={640}
        height={400}
        data={objects}
        margin={{
          top: 20, right: 20, bottom: 20, left: 80,
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
    width: '15em',
  },
  listStatus: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    margin: theme.spacing.unit,
    marginTop: 0,
    marginBottom: 0,
    padding: 0,
    width: '10em',
  },
  extractButton: {
    margin: theme.spacing.unit,
    width: '20em',
    float: 'right',
    marginRight: '3rem',
  },
  labeling:{
    margin: theme.spacing.unit,
    float: 'right',
  },
  tableLabels: {
    width: '80%',
  },
  title: {
    paddingLeft: '3em',
  }
});

class OverviewWorkspace extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {
      value: 0,
      url_join: '/gvlab-dat/workspace/ws-0/',
      total: {
          submitted: 0,
          remaining: 0,
          skipped: 0,
          labels_created: 0,
          complete: 0,
      },
      user: {
        submitted: 0,
        available: 0,
        skipped: 0,
        labels_created: 0,
        flag_false_predict: {
          mark: 0,
          accepted: 0,
        }
      },
      objects: [
              {
                "name": 'Label A', "total": 3, "user": 3, "predict": 0,
              },
              {
                "name": 'Label B', "total": 4, "user": 1, "predict": 3,
              },
              {
                "name": 'Label C', "total": 5, "user": 2, "predict": 3,
              },
              {
                "name": 'Label D', "total": 2, "user": 1, "predict": 1,
              },
              {
                "name": 'Label E', "total": 1, "user": 1, "predict": 0,
              },
          ],
      submitted: [],
      skipped: [],
      flaged: [],
      notice_review: [],
      };
  };

  getData(){
    setTimeout(() => {
      fetch(window.location.href+'api-get-data/', {})
      .then(response => {
          if(response.status !== 200){
            return "FAILED";
          }
          return response.json();
        }
      ).then(__data__ => {
          if (__data__ === "FAILED") return;
          this.setState({
            url_join: __data__.url_join,
            total: __data__.total,
            user: __data__.user,
            objects: __data__.objects,
            submitted: __data__.submitted,
            skipped: __data__.skipped,
            flaged: __data__.flaged,
            notice_review: __data__.notice_review,
          });
      });     
    }, 100);
  };

  componentDidMount(){
    this.getData();
  };

  handleStartLabeling = () => {
    window.location.href = this.state.url_join;
  };

  render() {
    const { classes } = this.props;
    const {total, user, objects, submitted, skipped, flaged, notice_review} = this.state
    
    return (
      <div className={classes.root}>
      <Button variant="outlined" color="primary" className={classes.extractButton}>
          Extract Report To Admin
      </Button>
      <Button onClick={this.handleStartLabeling}
        variant="contained" color="primary" className={classes.labeling}>
          Labeling
      </Button>
      <div className={classes.root2}>
        <div>
          <Typography gutterBottom variant="h5" component="h2" className={classes.title}>
            Objects Count
          </Typography>
          <ChartObjectsCount objects={objects}/>
        </div>

        <ProgressesTable total={total} user={user} />
      </div>

      <TabShowLabels submitted={submitted} skipped={skipped} flaged={flaged} notice_review={notice_review}/>

      </div>

    );
  }
}

OverviewWorkspace.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(OverviewWorkspace);

