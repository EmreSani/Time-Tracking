// Kayıt işlemi fonksiyonu
async function register(username, email, password, confirmPassword, phone) {
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                phone: phone
            })
        });

        if (!response.ok) {
            throw new Error(`Registration failed: ${response.statusText}`);
        }

        // Kayıt başarılı olursa login sayfasına yönlendir
        alert('Registration successful! Please log in.');
        window.location.href = 'login.html';
    } catch (error) {
        console.error(`Registration error: ${error}`);
        alert('Registration failed, please try again.');
    }
}

// Register butonuna tıklayınca çağrılacak fonksiyon
document.getElementById('register-button').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('phone').value;

    register(username, email, password, confirmPassword, phone);
});

// "Zaten bir hesabım var" linkine tıklayınca login sayfasına yönlendirme
document.getElementById('back-to-login').addEventListener('click', () => {
    window.location.href = 'login.html';
});
