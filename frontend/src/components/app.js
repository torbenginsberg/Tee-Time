import React from 'react';
import { Route } from 'react-router-dom';
import Splash from './splash/splash';
import { Switch } from 'react-router-dom';
import LoginFormContainer from './session/login_form_container';
import SignUpFormContainer from './session/signup_form_container';
import NavbarContainer from './navbar/navbar_container';
import reset from '../stylesheets/reset.css';
import { AuthRoute } from '../util/routes_util';

const App = () => (
    <div>
        {/* <NavbarContainer /> */}
        <Switch>
            <Route exact path='/' component={Splash} />
            <AuthRoute exact path='/login' component={LoginFormContainer} />
            <AuthRoute exact path='/signup' component={SignUpFormContainer} />
        </Switch>
    </div>
);

export default App;