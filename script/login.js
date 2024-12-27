document.getElementById('login-btn').addEventListener('click', async function () {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
    
        if (response.ok) {
            const data = await response.json();
            alert('Login successful!');
            window.location.href = '/index'; // Redirect on success
        } else {
            const error = await response.json();
            alert(`Login failed: ${error.message}`);
        }
    
    }
}

);
