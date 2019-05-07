import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import ContributeTable from './table-contribute';
import UserTable from './table-user';
import RequestTable from './table-request';
import AcceptedTable from './table-accepted';

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" dir={dir} style={{ padding: 8 * 3 }}>
      {children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired,
};

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

  },
  root2: {
    paddingTop: '1rem',
    paddingBottom: '6rem',
    width: '95%',
  }
});

class Contribute extends React.Component {
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
    const viewsite = document.getElementById("adminsite") != null;

    return (
      <div className={classes.root}>
      <div className={classes.root2}>
       { viewsite ? (
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Request Contributes" />
            <Tab label="Accepted Contributes" />
          </Tabs>
        </AppBar>
        ) : (
          <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Available Contributes" />
            <Tab label="Your Contributes" />
          </Tabs>
        </AppBar>
          )
        }
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={this.state.value}
          onChangeIndex={this.handleChangeIndex}
        >
          <TabContainer dir={theme.direction}>
          <span id="contribute_status">List contributes available</span>
          <div>
            { viewsite ? (
                React.createElement(RequestTable)
              ) : (
                React.createElement(ContributeTable)
              )
            }
          </div>
          </TabContainer>

          <TabContainer dir={theme.direction}>Your contributes information
          <div>
            { viewsite ? (
                React.createElement(AcceptedTable)
              ) : (
                React.createElement(UserTable)
              )
            }
          </div>
          </TabContainer>

        </SwipeableViews>
      </div>
      </div>
    );
  }
}

Contribute.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(Contribute);

