import React, { useState } from 'react';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed.');
            }

            const user = await response.json();
            localStorage.setItem('loggedIn', 'true');

            // Invoke onLogin prop function if provided
            if (typeof onLogin === 'function') {
                onLogin(user);  // Pass the user to parent component via onLogin
            } else {
                console.error('onLogin is not a function');
            }
        } catch (error) {
            setErrorMessage('Invalid username or password.');
            console.error(error);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: newUsername, password: newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error during sign-up.');
            }

            alert('Sign-up successful! You can now log in.');
            setIsSignUp(false);
        } catch (error) {
            setErrorMessage('Error during sign-up: ' + error.message);
            console.error(error);
        }
    };

    return (
        <div>
            <h1>{isSignUp ? 'Sign Up' : 'Login'} to Wings Cafe Inventory System</h1>
            {isSignUp ? (
                <form onSubmit={handleSignUp}>
                    <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="New Username"
                        required
                    />
                    <br />
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        required
                    />
                    <br />
                    <button type="submit">Sign Up</button>
                    <p className="error">{errorMessage}</p>
                </form>
            ) : (
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                    <br />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <br />
                    <button type="submit">Login</button>
                    <p className="error">{errorMessage}</p>
                </form>
            )}
            <button onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Already a user? Log in here' : 'New user? Sign Up here'}
            </button>
        </div>
    );
};

export default Login;
