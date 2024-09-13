document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcome-message');
    const username = localStorage.getItem('username');
  
    if (username) {
      welcomeMessage.textContent = `Welcome, ${username}!`;
    } else {
      welcomeMessage.textContent = 'Welcome, Guest!';
    }
  
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      window.location.href = 'login.html'; // Giriş sayfasına yönlendir
    });
  });
  