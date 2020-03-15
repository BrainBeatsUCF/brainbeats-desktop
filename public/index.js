import React from 'react';
import ReactDOM from 'react-dom';

import Navigation from './components/Navigation/Navigation';
import Home from './components/Home/Home';
import Studio from './components/Studio/Studio';

import './index.css';

class App extends React.Component{
	constructor(props) {
		super(props);
		this.state = { 
			username: '',
			password: '',

			isAuthenticated: true,
			isDisplayingHomePage: true
		};
	}

	handleAuthentication() {
		event.preventDefault();
		const username = document.getElementById("username").value;
		const password = document.getElementById("password").value;
		
		const allowed = {
			username: "test@test.com",
			password: "1234"
		}

		// make auth request
		if(username === allowed.username && password === allowed.password) {
			this.setState({isAuthenticated: true});
		}
	}

	handleLogoutUser() {
		// clear user data
		this.setState({isAuthenticated: false})
	}

	renderLoginView() {
		return(
			<div className="LoginPage">
				<form className="LoginForm" onSubmit={() => this.handleAuthentication()}>
				<input type="email" placeholder="username" id="username"></input>
				<input type="password" placeholder="password" id="password"></input>
				<input type="submit" value="Login"></input>
				</form>
			</div>
		);
	}

	renderLandingView() {
		const displayedPage = this.state.isDisplayingHomePage ? <Home></Home> : <Studio></Studio>

		return(
			<div className="MainPage">
				<Navigation
					handleHomeButtonTapped={() => this.setState({isDisplayingHomePage: true})}
					handleStudioButtonTapped={() => this.setState({isDisplayingHomePage: false})}
					handleLogoutUser={() => this.handleLogoutUser()}
				></Navigation>
				<div className="MainPageSection">
					{displayedPage}
				</div>
			</div>
		);
	}

	render() {
		return this.state.isAuthenticated ? this.renderLandingView() : this.renderLoginView();
	}
}

ReactDOM.render(<App />, document.getElementById('app'))