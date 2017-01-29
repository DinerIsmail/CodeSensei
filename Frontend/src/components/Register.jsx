import react from 'react';
import { Link, browserHistory } from 'react-router';

class RegisterForm extends React.Component {
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
	handleSubmit(ev) {
		ev.preventDefault();
    this.setState({ isLoading: true });

		auth
			.createUserPromise(this.state.email, this.state.password)
			.then(() => {
				return auth.loginPromise(this.state.email, this.state.password);
			}).then(() => {
				this.setState({ password: "", isLoading: false });
				this.props.jump("WelcomeMessage");
			}).catch((error) => {
        this.setState({ isLoading: false });
        utils.addNotification("danger", "Could not create a new user: "+error.message);
			});
	}

	render() {
		return (
			<form id="registerform" action="index.html" method="post" onSubmit={(ev) => this.handleSubmit(ev)}>
		    <h3 className="font-green-seagreen">Register</h3>
		    <p className="hint"> Email: </p>
		    <div className="form-group">
	        {/* ie8, ie9 does not support html5 placeholder, so we just show field title for that */}
	        <label className="control-label visible-ie8 visible-ie9">Email</label>
	        <input className="form-control placeholder-no-fix" type="text" placeholder="Email" name="username" onChange={(ev) => this.updateEmail(ev)}/> </div>
		    <p className="hint"> Password: </p>
		    <div className="form-group">
	        <label className="control-label visible-ie8 visible-ie9">Password</label>
	        <input className="form-control placeholder-no-fix" type="password" autoComplete="off" id="register_password" placeholder="Password" name="password" onChange={(ev) => this.updatePassword(ev)}/> </div>
		    <div className="form-actions">
	        <button type="button" id="back-register-btn" className="btn btn-default" onClick={()=>this.props.jump("Login")}>Back</button>
	        <button type="submit" id="register-submit-btn" className="btn green-seagreen uppercase pull-right">{ this.state.isLoading ? <span>Create&nbsp; <i className="fa fa-spinner fa-spin" aria-hidden="true"></i></span> : "Create"}</button>
		    </div>
			</form>
		)
	}
}

export default RegisterForm;
