import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Redirect, Route } from "react-router-dom";

const PrivateRoute = ({ component: Component, auth, ...rest }) => {
  const { loading, isAuthenticated } = auth;
  return (
    <Route {...rest}
      render={(props) =>
        isAuthenticated && !loading ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(PrivateRoute);
