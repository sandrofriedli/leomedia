const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessage.textContent = '';

    const formData = new FormData(loginForm);

    try {
        const response = await fetch('./api/login.php', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.status === 'success') {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect');

            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                window.location.href = 'index.html';
            }
        } else {
            errorMessage.textContent = result.message || 'Ein unbekannter Fehler ist aufgetreten.';
        }
    } catch (error) {
        console.error('Login-Fehler:', error);
        errorMessage.textContent = 'Verbindung zum Server fehlgeschlagen.';
    }
});
