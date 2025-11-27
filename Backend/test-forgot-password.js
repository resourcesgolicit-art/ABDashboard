// Test script for forgot password functionality
const testForgotPassword = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com'
            })
        });

        const data = await response.json();
        
        console.log('Status Code:', response.status);
        console.log('Response:', data);
        
        if (response.ok) {
            console.log('✅ Forgot password endpoint is working!');
        } else {
            console.log('❌ Forgot password endpoint failed');
        }
        
    } catch (error) {
        console.error('❌ Error testing forgot password:', error);
    }
};

testForgotPassword();