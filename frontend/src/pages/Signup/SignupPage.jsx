import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignupPage.css';


export default function SignupPage() {
    const navigate = useNavigate();
    
    const [error, setError] = useState('');
    const [show2FAPrompt, setShow2FAPrompt] = useState(false);
    
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [wants2FA, setWants2FA] = useState(false);

    const [usernameStatus, setUsernameStatus] = useState({ checked: false, available: false, message: '' });
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    const checkUsername = async () => {
        if (!username || username.trim().length < 3) {
            setUsernameStatus({ checked: true, available: false, message: 'Must be at least 3 characters.' });
            return;
        }

        setIsCheckingUsername(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/check-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await response.json();
            
            setUsernameStatus({
                checked: true,
                available: data.available,
                message: data.message
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsCheckingUsername(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!usernameStatus.available) {
            setError('Please verify that your username is available first.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Signup failed');

            setShow2FAPrompt(true);
        } catch (err) {
            setError(err.message);
        }
    };

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

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card">
                <h2 className="auth-title">Create an Account</h2>
                
                {error && <div className="error-banner">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        {/* Username field with availability check */}
                        <label className="form-label">Username</label>
                        <div className="username-input-row">
                            <input 
                                type="text" 
                                className="form-input" 
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setUsernameStatus({ checked: false, available: false, message: '' });
                                }}
                                required
                            />
                            <button 
                                type="button" 
                                className="btn-secondary compact"
                                onClick={checkUsername}
                                disabled={isCheckingUsername}
                            >
                                {isCheckingUsername ? '...' : 'Check'}
                            </button>
                        </div>
                        {usernameStatus.checked && (
                            <span className={`status-text ${usernameStatus.available ? 'success' : 'fail'}`}>
                                {usernameStatus.message}
                            </span>
                        )}
                    </div>

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

                    <div className="checkbox-group">
                        <input 
                            type="checkbox" 
                            id="wants2FA"
                            checked={wants2FA}
                            onChange={(e) => setWants2FA(e.target.checked)}
                        />
                        <label htmlFor="wants2FA" className="checkbox-label">
                            Secure my account with Two-Factor Authentication (Recommended)
                        </label>
                    </div>

                    <button type="submit" className="btn-primary full-width">Sign Up</button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login" className="link-text">Log in</Link>
                </p>
            </div>
        </div>
    );
}