import React from 'react';
import { Link, browserHistory } from 'react-router';

//import * as auth from '../auth';

class Login extends React.Component {
  constructor(props) {
    super(props);
		this.state = { email:"", password:"", isLoading: false };
	}

	updatePassword(ev) {
		this.setState({ password: ev.target.value });
	}
	updateEmail(ev) {
		this.setState({ email: ev.target.value });
	}

	handleSuccess() {
    auth.getUserMetaPromise()
			.then((snapshot) => {
				browserHistory.push("/home");
			})
			.catch((error) => {
				console.error("[LOGIN]: Error occured while getting meta. Ignoring and moving to home.", error);
				browserHistory.push("/home");
			});
	}

	handleSubmit(ev) {
		ev.preventDefault();
    this.setState({ isLoading: true });

		auth
			.loginPromise(this.state.email, this.state.password)
			.then(() => {
				this.setState({ password:"", isLoading: false });

				this.handleSuccess();
			})
			.catch((error) => {
        utils.addNotification("danger", "Invalid credentials. We could not log you in.");
				console.error(error);
				this.setState({ password:"", isLoading: false });
			});
	}

	render() {
		return (
			<form id="loginform" className="login-form" onSubmit={(ev) => this.handleSubmit(ev)} method="post">
        <h3 className="form-title font-green-seagreen">Sign In</h3>
        <div className="form-group">
          {/* ie8, ie9 does not support html5 placeholder, so we just show field title for that */}
          <label className="control-label visible-ie8 visible-ie9">Username</label>
          <input className="form-control form-control-solid placeholder-no-fix" type="email" autoComplete="off" placeholder="Email" name="username" onChange={(ev) => this.updateEmail(ev)} value={this.state.email}/>
        </div>
        <div className="form-group">
          <label className="control-label visible-ie8 visible-ie9">Password</label>
          <input className="form-control form-control-solid placeholder-no-fix" type="password" autoComplete="off" placeholder="Password" name="password" onChange={(ev) => this.updatePassword(ev)} value={this.state.password}/>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn green-seagreen uppercase">{ this.state.isLoading ? <span>Sign In&nbsp; <i className="fa fa-spinner fa-spin" aria-hidden="true"></i></span> : "Sign In"}</button>
        </div>
        <div className="create-account" onClick={browserHistory.push("register")}>
          <p>
            <a id="register-btn" className="uppercase">Create an account</a>
          </p>
        </div>
      </form>
		)
	}
}

export default Login;
