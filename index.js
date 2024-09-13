document.addEventListener('DOMContentLoaded', () => {
    // Welcome ve logout elementlerini seç
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');

    // Kullanıcı adını localStorage'dan al
    const username = localStorage.getItem('username');

    // Kullanıcı adı mevcutsa, welcome mesajını güncelle
    if (username) {
        welcomeMessage.textContent = `Welcome, ${username}!`;
    } else {
        // Kullanıcı adı yoksa, login sayfasına yönlendir
        window.location.href = 'login.html';
    }

    // Logout butonuna tıklanınca kullanıcıyı oturumdan çıkar
    logoutBtn.addEventListener('click', () => {
        // LocalStorage'daki verileri temizle (authToken ve username)
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');

        // Kullanıcıyı login sayfasına yönlendir
        window.location.href = 'login.html';
    });
});
