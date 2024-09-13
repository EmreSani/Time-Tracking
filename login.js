// Fonksiyon: Login işlemi
async function login(username, password) {
    try {
        const response = await fetch('http://localhost:8080/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error(`Login failed: ${response.statusText}`);
        }

        const data = await response.json();
        const authToken = data.token; // Backend'den gelen token verisini kullan
        localStorage.setItem('authToken', authToken); // Token'ı localStorage'a kaydet
        localStorage.setItem('username', username); // Kullanıcı adını kaydet

        // Başarılı login sonrası yönlendirme
        window.location.href = 'index.html'; // Login sonrası ana sayfaya yönlendir
    } catch (error) {
        console.error(`Login error: ${error}`);
        alert('Login failed, please check your credentials');
    }
}

// Sayfa yüklendiğinde login butonuna tıklama event'i ekle
document.getElementById('login-button').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    login(username, password);
});

// Kayıt sayfasına yönlendirme (opsiyonel)
document.getElementById('show-register').addEventListener('click', () => {
    window.location.href = 'register.html'; // Kayıt sayfasına yönlendir
});
