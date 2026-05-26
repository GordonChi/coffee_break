import { useState } from 'react';

export default function Setup2FA() {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [manualSecret, setManualSecret] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generateQRCode = async () => {
        // When we click the button, we want to show a 
        // loading state while we wait for the backend 
        // to generate the QR code and secret
        setIsLoading(true);
        
        try {
            // Simulate a delay to show the loading state (remove in production)
            // 3000 = 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000));
            /*
            You can also change the throttling time with browser developer tools:
            1. Open DevTools (F12 or right-click > Inspect)
            2. Go to the "Network" tab
            3. Find the "Throttling" dropdown (around the right side on Firefox browser)
            4. Select an option from the dropdown (e.g., "Slow 3G") to simulate a slower network connection and see the loading state in action.
            */


            // Knock on the backend server to generate a new 2FA secret and QR code
            const response = await fetch('http://127.0.0.1:5000/api/auth/setup-2fa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) throw new Error('Failed to generate 2FA');
            
            const data = await response.json();
            
            // The backend should return an object with the QR code URL and the manual secret key
            // when the QR code is generated successfully, change the screen
            setQrCodeUrl(data.qrCode);
            setManualSecret(data.secret);
        } catch (error) {
            console.error("Error fetching QR code:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="setup-2fa-container">
            <h2 className="setup-2fa-title">Secure Your Account</h2>
            
            {!qrCodeUrl ? (
                <button 
                    className="btn-primary" 
                    onClick={generateQRCode} 
                    disabled={isLoading}
                >
                    {isLoading ? 'Generating Setup Key...' : 'Set Up 2FA'}
                </button>
            ) : (
                <div className="qr-code-display">
                    <p className="instruction-text">1. Scan this QR code with Google Authenticator or Authy:</p>
                    
                    <img className="qr-image" src={qrCodeUrl} alt="2FA QR Code" />
                    
                    <p className="instruction-text">Can't scan the code? Enter this key manually:</p>
                    <code className="manual-key">{manualSecret}</code>
                    
                    <div className="verify-section">
                        <p className="instruction-text">2. Enter the 6-digit pin from your app to verify:</p>
                        <div className="verify-input-group">
                            <input 
                                type="text" 
                                className="pin-input"
                                placeholder="000000" 
                                maxLength="6" 
                            />
                            <button className="btn-primary">Verify Pin</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}