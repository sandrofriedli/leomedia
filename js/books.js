const booksGrid = document.getElementById('booksGrid');
const bookModal = document.getElementById('bookModal');
const modalTitle = document.getElementById('modalTitle');
const bookForm = document.getElementById('bookForm');
const authControls = document.getElementById('auth-controls');
const addBookBtnContainer = document.getElementById('add-book-btn-container');

let allBooks = [];
let loggedIn = false;

async function fetchBooks() {
    try {
        const response = await fetch('./api/api.php');
        if (!response.ok) {
            throw new Error('Netzwerk-Antwort war nicht ok.');
        }

        const books = await response.json();
        allBooks = books;
        renderBooks(allBooks);
    } catch (error) {
        booksGrid.innerHTML = `
            <p class="text-red-400 col-span-full text-center">
                Fehler beim Laden der Bücher. Überprüfe die API-Verbindung und die Datenbank.
            </p>
        `;
        console.error('Fehler:', error);
    }
}

function renderBooks(books) {
    booksGrid.innerHTML = '';

    if (books.length === 0) {
        booksGrid.innerHTML = `
            <p class="text-gray-400 col-span-full text-center">Noch keine Bücher vorhanden.</p>
        `;
        return;
    }

    books.forEach((book) => {
        const card = document.createElement('a');

        const rawLink = book.link || '#';
        let cleanLink = rawLink;
        const markdownMatch = rawLink.match(/\((https?:\/\/[^\s)]+)\)/);

        if (markdownMatch && markdownMatch[1]) {
            cleanLink = markdownMatch[1];
        }

        card.href = cleanLink;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'storybook-card';

        let adminControlsHTML = '';

        if (loggedIn) {
            adminControlsHTML = `
                <div class="admin-controls absolute top-2 right-2 flex gap-2" style="transform: translateZ(2px);">
                    <button onclick="event.preventDefault(); event.stopPropagation(); deleteBook(${book.id})" class="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    <button onclick="event.preventDefault(); event.stopPropagation(); openModal(allBooks.find(b => b.id === ${book.id}))" class="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
                    </button>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="book-cover">
                <div class="emoji-container">${book.emoji}</div>
                <h3>${book.title}</h3>
            </div>
            ${adminControlsHTML}
        `;

        booksGrid.appendChild(card);
    });
}

function openModal(book = null) {
    bookForm.reset();

    if (book) {
        modalTitle.textContent = 'Buch bearbeiten';
        document.getElementById('bookId').value = book.id;
        document.getElementById('bookTitle').value = book.title;
        document.getElementById('bookEmoji').value = book.emoji;
        document.getElementById('bookLink').value = book.link;
    } else {
        modalTitle.textContent = 'Neues Buch hinzufügen';
    }

    bookModal.classList.remove('hidden');
    bookModal.classList.add('flex');
}

function closeModal() {
    bookModal.classList.add('hidden');
    bookModal.classList.remove('flex');
}

async function handleFormSubmit() {
    const bookId = document.getElementById('bookId').value;
    const bookData = {
        title: document.getElementById('bookTitle').value,
        emoji: document.getElementById('bookEmoji').value,
        link: document.getElementById('bookLink').value,
    };

    const method = bookId ? 'PUT' : 'POST';

    if (bookId) {
        bookData.id = bookId;
    }

    try {
        const response = await fetch('./api/api.php', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData),
        });

        const result = await response.json();

        if (result.status === 'success') {
            closeModal();
            fetchBooks();
        } else {
            alert('Fehler: ' + result.message);
        }
    } catch (error) {
        alert('Ein Fehler ist aufgetreten.');
        console.error(error);
    }
}

async function deleteBook(id) {
    if (!confirm('Bist du sicher, dass du dieses Buch löschen möchtest?')) {
        return;
    }

    try {
        const response = await fetch('./api/api.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        const result = await response.json();

        if (result.status === 'success') {
            fetchBooks();
        } else {
            alert('Fehler beim Löschen: ' + result.message);
        }
    } catch (error) {
        alert('Ein Fehler ist aufgetreten.');
        console.error(error);
    }
}

async function checkLoginStatus() {
    try {
        const response = await fetch('./api/check_login.php');
        const data = await response.json();
        loggedIn = data.loggedIn;
    } catch (error) {
        loggedIn = false;
    }

    if (loggedIn) {
        authControls.innerHTML = `
            <button onclick="logout()" class="btn-secondary text-sm font-semibold py-2 px-4 rounded-lg">Logout</button>
        `;
        addBookBtnContainer.classList.remove('hidden');
    } else {
        authControls.innerHTML = `
            <a href="login.html" class="btn-primary text-sm font-semibold py-2 px-4 rounded-lg">Login</a>
        `;
        addBookBtnContainer.classList.add('hidden');
    }

    fetchBooks();
}

async function logout() {
    await fetch('./api/logout.php');
    loggedIn = false;
    checkLoginStatus();
}

document.addEventListener('DOMContentLoaded', checkLoginStatus);
