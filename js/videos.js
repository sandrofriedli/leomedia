const videosGrid = document.getElementById('videosGrid');
const formModal = document.getElementById('formModal');
const detailModal = document.getElementById('detailModal');
const detailModalContent = document.getElementById('detailModalContent');
const formModalTitle = document.getElementById('formModalTitle');
const videoForm = document.getElementById('videoForm');
const authControls = document.getElementById('auth-controls');
const addVideoBtnContainer = document.getElementById('add-video-btn-container');

const VIDEO_COLOR_MAP = {
    'peppa pig': '#f472b6',
    'paw patrol': '#3b82f6',
    'bluey': '#60a5fa',
    'cocomelon': '#f97316',
    'feuerwehrmann sam': '#facc15',
    'bob der baumeister': '#f59e0b',
    'die sendung mit der maus': '#f97316',
    'loewenzahn': '#22c55e',
    'sesamstrasse': '#facc15',
    'die biene maja': '#fcd34d',
    'heidi': '#fb7185',
    'wickie und die starken maenner': '#38bdf8',
    'bobo siebenschlaefer': '#a855f7',
    'der kleine prinz': '#818cf8',
    'fieps': '#34d399',
    'nils holgersson': '#93c5fd',
    'pinocchio': '#fb7185',
    'der kleine drache kokosnuss': '#f97316'
};

let allVideos = [];
let loggedIn = false;

async function fetchVideos() {
    try {
        const response = await fetch('./api/videos_api.php');

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Netzwerk-Antwort war nicht ok.');
        }

        const videos = await response.json();
        allVideos = videos;
        renderVideos(allVideos);
    } catch (error) {
        videosGrid.innerHTML = `
            <p class="text-red-400 col-span-full text-center">
                Fehler beim Laden der Videos. Ueberpruefe die API-Verbindung und die Datenbank-Struktur. Details: ${escapeHtml(error.message || 'Unbekannter Fehler')}
            </p>
        `;
    }
}

function renderVideos(videos) {
    videosGrid.innerHTML = '';

    if (!videos || videos.length === 0) {
        videosGrid.innerHTML = `
            <p class="text-gray-400 col-span-full text-center">Noch keine Videos vorhanden.</p>
        `;
        return;
    }

    videos.forEach((video) => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.addEventListener('click', () => openDetailModal(video));

        const safeTitle = escapeHtml(video.title || '');
        const safeSummary = escapeHtml(video.summary || 'Keine Beschreibung verfuegbar.');
        const safePlatform = escapeHtml(video.platform || '');
        const safeTags = extractSafeTags(video.tags);
        const ageLabel = Number(video.age) || 0;
        const colorInfo = getVideoColorInfo(video);

        let adminControlsHTML = '';
        if (loggedIn) {
            adminControlsHTML = `
                <div class="admin-controls absolute top-2 right-2 flex gap-2 z-10">
                    <button type="button" class="delete-video-btn bg-red-600 hover:bg-red-700 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center shadow-lg" data-video-id="${Number(video.id)}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                    <button type="button" class="edit-video-btn bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
                    </button>
                </div>
            `;
        }

        card.innerHTML = `
            ${adminControlsHTML}
            <div class="video-color-block" style="background-color:${colorInfo.background}; color:${colorInfo.text};">
                ${safePlatform ? `<span class="video-color-block__platform">${safePlatform}</span>` : ''}
                <span class="video-color-block__title">${safeTitle}</span>
            </div>
            <div class="video-card-content">
                <p class="video-card-summary">${safeSummary}</p>
                <div class="video-card-meta">
                    <span class="video-age-badge">Ab ${ageLabel} J.</span>
                    ${safeTags
                        .slice(0, 3)
                        .map((tag) => `<span class="video-tag">${tag}</span>`)
                        .join('')}
                </div>
            </div>
        `;

        const deleteBtn = card.querySelector('.delete-video-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const id = Number(deleteBtn.dataset.videoId);
                if (!Number.isNaN(id)) {
                    deleteVideo(id);
                }
            });
        }

        const editBtn = card.querySelector('.edit-video-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                openFormModal(video);
            });
        }

        videosGrid.appendChild(card);
    });
}

function openFormModal(video = null) {
    videoForm.reset();

    if (video) {
        formModalTitle.textContent = 'Video bearbeiten';
        document.getElementById('videoId').value = video.id;
        document.getElementById('videoTitle').value = video.title;
        document.getElementById('posterUrl').value = video.posterUrl;
        document.getElementById('age').value = video.age;
        document.getElementById('platform').value = video.platform;
        document.getElementById('firstAired').value = video.firstAired;
        document.getElementById('imdbRating').value = video.imdbRating;
        document.getElementById('tags').value = video.tags;
        document.getElementById('summary').value = video.summary;
    } else {
        formModalTitle.textContent = 'Neues Video hinzufuegen';
    }

    formModal.classList.remove('hidden');
    formModal.classList.add('flex');
}

function closeFormModal() {
    formModal.classList.add('hidden');
    formModal.classList.remove('flex');
}

function openDetailModal(video) {
    const safeTitle = escapeHtml(video.title || '');
    const safeSummary = escapeHtml(video.summary || 'Keine Beschreibung verfuegbar.');
    const safeTags = extractSafeTags(video.tags);
    const ageLabel = Number(video.age) || 0;
    const firstAired = escapeHtml(video.firstAired || '');
    const imdbRating = escapeHtml(video.imdbRating || '');
    const safePlatform = escapeHtml(video.platform || '');
    const colorInfo = getVideoColorInfo(video);

    detailModalContent.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-1">
                <div class="detail-color-block" style="background-color:${colorInfo.background}; color:${colorInfo.text};">
                    ${safePlatform ? `<span class="video-color-block__platform">${safePlatform}</span>` : ''}
                    <span class="video-color-block__title">${safeTitle}</span>
                </div>
            </div>
            <div class="md:col-span-2 p-4 space-y-6">
                <div>
                    <div class="detail-meta">
                        ${firstAired ? `<span>Erstausstrahlung: ${firstAired}</span>` : ''}
                        ${imdbRating ? `<span>IMDb: ${imdbRating} / 10</span>` : ''}
                        <span>Ab ${ageLabel} J.</span>
                    </div>
                </div>
                <p class="text-gray-300 leading-relaxed">${safeSummary}</p>
                ${
                    safeTags.length
                        ? `<div class="detail-tags">${safeTags
                              .map((tag) => `<span class="detail-tag">${tag}</span>`)
                              .join('')}</div>`
                        : ''
                }
            </div>
        </div>
    `;

    detailModal.classList.remove('hidden');
    detailModal.classList.add('flex');
}

function closeDetailModal() {
    detailModal.classList.add('hidden');
    detailModal.classList.remove('flex');
}

videoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(videoForm);
    const id = formData.get('id');

    if (id) {
        formData.append('_method', 'PUT');
    }

    try {
        const response = await fetch('./api/videos_api.php', { method: 'POST', body: formData });
        const result = await response.json();

        if (result.status === 'success') {
            closeFormModal();
            fetchVideos();
        } else {
            alert('Fehler: ' + result.message);
        }
    } catch (error) {
        alert('Ein Fehler ist aufgetreten.');
    }
});

async function deleteVideo(id) {
    if (!confirm('Bist du sicher, dass du dieses Video loeschen moechtest?')) {
        return;
    }

    try {
        const response = await fetch(`./api/videos_api.php?id=${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.status === 'success') {
            fetchVideos();
        } else {
            alert('Fehler beim Loeschen: ' + result.message);
        }
    } catch (error) {
        alert('Ein Fehler ist aufgetreten.');
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
        addVideoBtnContainer.classList.remove('hidden');
    } else {
        authControls.innerHTML = `
            <a href="login.html?redirect=videos.html" class="btn-primary text-sm font-semibold py-2 px-4 rounded-lg">Login</a>
        `;
        addVideoBtnContainer.classList.add('hidden');
    }

    fetchVideos();
}

async function logout() {
    await fetch('./api/logout.php');
    loggedIn = false;
    window.location.reload();
}

function getVideoColorInfo(video) {
    const background = getSeriesColor(video);
    return {
        background,
        text: getReadableTextColor(background)
    };
}

function getSeriesColor(video) {
    const key = String(video.title || '').trim().toLowerCase();
    return VIDEO_COLOR_MAP[key] || '#4b5563';
}

function getReadableTextColor(hexColor) {
    const rgb = hexToRgb(hexColor);
    if (!rgb) {
        return '#f8fafc';
    }

    const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    return luminance > 0.6 ? '#111827' : '#f8fafc';
}

function hexToRgb(hex) {
    const cleanHex = hex.replace('#', '').trim();

    if (!(cleanHex.length === 3 || cleanHex.length === 6)) {
        return null;
    }

    const normalized = cleanHex.length === 3
        ? cleanHex.split('').map((char) => char + char).join('')
        : cleanHex;

    const value = parseInt(normalized, 16);
    if (Number.isNaN(value)) {
        return null;
    }

    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255
    };
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function extractSafeTags(tags) {
    if (!tags) {
        return [];
    }

    const rawTags = Array.isArray(tags) ? tags : String(tags).split(',');
    return rawTags
        .map((tag) => escapeHtml(tag.trim()))
        .filter((tag) => tag.length > 0);
}

document.addEventListener('DOMContentLoaded', checkLoginStatus);
