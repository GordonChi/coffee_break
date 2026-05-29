import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css'; // Importing the new dedicated stylesheet


/* 
The authentication pages 
These pages will handle both login and signup (for now) and will be accessible from the NavBar.
The AuthPage will have two modes: Login and Signup, which can be toggled by the user. 
After the user successfully logs in, the navbar should update to show current user info
and a logout button instead of the Sign In/Sign Up links. 
*/

export default function AuthPage() {
    const navigate = useNavigate();
    
    // UI States
    const [isLogin, setIsLogin] = useState(false);
    const [show2FAPrompt, setShow2FAPrompt] = useState(false);
    const [error, setError] = useState('');
    
    // Form Data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                // temp: just navigate to home for now, we will handle 2FA in a later step
                navigate('/');
            } catch (err) {
                setError(err.message);
            }
        } else {
            // SIGN UP LOGIC
            try {
                const response = await fetch('http://localhost:5000/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Signup failed');
                }

                // Show the 2FA prompt on success
                setShow2FAPrompt(true);

            } catch (err) {
                setError(err.message);
            }
        }
    };

    // --- THE 2FA PROMPT SCREEN ---
    if (show2FAPrompt) {
        return (
            <div className="auth-page-wrapper">
                <div className="auth-card">
                    <h2 className="auth-title">Account Created! 🎉</h2>
                    <p className="auth-subtitle">
                        Would you like to secure your account with Two-Factor Authentication? 
                        You can always do this later in your settings.
                    </p>
                    
                    <div className="prompt-actions">
                        <button className="btn-primary" onClick={() => navigate('/setup-2fa')}>
                            Set Up 2FA Now
                        </button>
                        <button className="btn-text" onClick={() => navigate('/')}>
                            Skip for Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- THE STANDARD LOGIN/SIGNUP FORM ---
    return (
        <div className="auth-page-wrapper">
            <div className="auth-card">
                <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
                
                {error && <div className="error-banner">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary full-width">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-footer">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        className="btn-text link-text" 
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>
        </div>
    );
}