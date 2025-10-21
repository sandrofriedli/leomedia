const heroSection = document.getElementById('heroSection');
const heroMedia = document.getElementById('heroMedia');
const heroAge = document.getElementById('heroAge');
const heroPlatform = document.getElementById('heroPlatform');
const heroTitle = document.getElementById('heroTitle');
const heroSummary = document.getElementById('heroSummary');
const heroFacts = document.getElementById('heroFacts');
const heroTags = document.getElementById('heroTags');
const heroWatchButton = document.getElementById('heroWatchButton');
const heroDetailsButton = document.getElementById('heroDetailsButton');
const ageSections = document.getElementById('ageSections');
const videosEmptyState = document.getElementById('videosEmptyState');

const formModal = document.getElementById('formModal');
const detailModal = document.getElementById('detailModal');
const detailModalContent = document.getElementById('detailModalContent');
const formModalTitle = document.getElementById('formModalTitle');
const videoForm = document.getElementById('videoForm');
const additionalPlatformsInput = document.getElementById('additionalPlatforms');
const authControls = document.getElementById('auth-controls');
const addVideoBtnContainer = document.getElementById('add-video-btn-container');

const AGE_BRACKETS = [
    {
        id: 'mini',
        title: 'Kuschelige Serien (0-2 Jahre)',
        description: 'Ruhige Geschichten mit viel Wärme, perfekt für Leo zum Entspannen.',
        min: 0,
        max: 2
    },
    {
        id: 'discover',
        title: 'Entdecker*innen (3-4 Jahre)',
        description: 'Humorvolle Serien zum Mitfiebern, die spielerisch Wissen vermitteln.',
        min: 3,
        max: 4
    },
    {
        id: 'heroes',
        title: 'Abenteuer ab 5 Jahren',
        description: 'Actionreiche und mutmachende Serien für große Leo-Abenteuer.',
        min: 5,
        max: 12
    }
];

const PLATFORM_LOGO_MAP = {
    netflix: 'assets/logos/netflix.svg',
    'netflix kids': 'assets/logos/netflix.svg',
    youtube: 'assets/logos/youtube.svg',
    'youtube kids': 'assets/logos/youtube.svg',
    'disney+': 'assets/logos/disney-plus.svg',
    'disney plus': 'assets/logos/disney-plus.svg',
    'prime video': 'assets/logos/prime-video.svg',
    'amazon prime': 'assets/logos/prime-video.svg',
    kika: 'assets/logos/kika.svg',
    'kika mediathek': 'assets/logos/kika.svg',
    ard: 'assets/logos/ard-mediathek.svg',
    'ard mediathek': 'assets/logos/ard-mediathek.svg'
};

const posterPlaceholderCache = new Map();

const PLACEHOLDER_GRADIENTS = [
    ['#1d4ed8', '#1e40af'],
    ['#0f766e', '#134e4a'],
    ['#a855f7', '#7e22ce'],
    ['#db2777', '#9d174d'],
    ['#f97316', '#c2410c'],
    ['#059669', '#047857'],
    ['#2563eb', '#1d4ed8'],
    ['#f59e0b', '#b45309']
];

const YOUTUBE_THUMBNAIL_BASE = 'https://i.ytimg.com/vi/';

let allVideos = [];
let loggedIn = false;
let featuredVideoId = null;

async function fetchVideos() {
    try {
        const response = await fetch('./api/videos_api.php');

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Netzwerk-Antwort war nicht ok.');
        }

        const videos = await response.json();
        allVideos = Array.isArray(videos) ? videos : [];
        renderVideos(allVideos);
    } catch (error) {
        allVideos = [];
        renderVideos(allVideos, error.message || 'Unbekannter Fehler beim Laden der Videos.');
    }
}

function renderVideos(videos, errorMessage = '') {
    ageSections.innerHTML = '';

    if (!Array.isArray(videos) || videos.length === 0) {
        heroSection.classList.add('hidden');
        videosEmptyState.classList.remove('hidden');
        if (errorMessage) {
            videosEmptyState.innerHTML = `
                <p class="text-lg font-semibold text-red-300">Fehler beim Laden</p>
                <p class="text-sm mt-2 text-red-200">${escapeHtml(errorMessage)}</p>
            `;
        } else {
            videosEmptyState.innerHTML = `
                <p class="text-lg font-semibold">Noch keine Serien hinterlegt.</p>
                <p class="text-sm mt-2">Sobald Inhalte in der Datenbank stehen, erscheinen sie hier automatisch.</p>
            `;
        }
        return;
    }

    videosEmptyState.classList.add('hidden');

    const featured = selectFeaturedVideo(videos);
    featuredVideoId = featured ? featured.id : null;

    if (featured) {
        heroSection.classList.remove('hidden');
        renderHero(featured);
    } else {
        heroSection.classList.add('hidden');
    }

    renderAgeSections(videos);
}

function selectFeaturedVideo(videos) {
    if (!Array.isArray(videos) || videos.length === 0) {
        return null;
    }

    const ratedVideos = videos
        .filter((video) => !Number.isNaN(parseFloat(video.imdbRating)))
        .sort((a, b) => parseFloat(b.imdbRating || 0) - parseFloat(a.imdbRating || 0));

    if (ratedVideos.length > 0) {
        return ratedVideos[0];
    }

    // Fallback: nimm das erste Video, falls keine Bewertung vorhanden ist
    return videos[0];
}

function renderHero(video) {
    const safeTitle = escapeHtml(video.title || 'Unbenannte Serie');
    const summary = video.summary || 'Noch keine Beschreibung vorhanden.';
    const age = getAge(video);
    const tags = extractSafeTags(video.tags);
    const platforms = normalizePlatformEntries(video);
    const primaryPlatform = platforms[0] || null;
    const facts = [];

    heroMedia.innerHTML = createHeroMediaMarkup(video, safeTitle);
    heroTitle.textContent = video.title || 'Unbenannte Serie';
    heroSummary.textContent = summary;

    heroAge.textContent = `Ab ${age} Jahren`;

    if (primaryPlatform && primaryPlatform.name) {
        heroPlatform.textContent = primaryPlatform.name;
        heroPlatform.classList.remove('hidden');
    } else {
        heroPlatform.classList.add('hidden');
    }

    if (video.firstAired) {
        facts.push(`<span><svg class="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1H6z"/><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zm-11 3a1 1 0 112 0 1 1 0 01-2 0zm4 0a1 1 0 112 0 1 1 0 01-2 0z" clip-rule="evenodd"/></svg>${escapeHtml(String(video.firstAired))}</span>`);
    }

    if (video.imdbRating) {
        facts.push(`<span><svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.143 3.513a1 1 0 00.95.69h3.688c.969 0 1.371 1.24.588 1.81l-2.985 2.17a1 1 0 00-.364 1.118l1.143 3.513c.3.921-.755 1.688-1.54 1.118l-2.985-2.17a1 1 0 00-1.175 0l-2.985 2.17c-.784.57-1.838-.197-1.539-1.118l1.142-3.513a1 1 0 00-.364-1.118l-2.985-2.17c-.783-.57-.38-1.81.588-1.81h3.689a1 1 0 00.95-.69l1.143-3.513z"/></svg>${escapeHtml(String(video.imdbRating))} IMDb</span>`);
    }

    const additionalPlatforms = platforms.slice(1).map((entry) => entry.name).filter((name) => name && name.length > 0);
    if (additionalPlatforms.length > 0) {
        const label = additionalPlatforms.map((name) => escapeHtml(name)).join(', ');
        facts.push(`<span><svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>Auch bei ${label}</span>`);
    }

    if (facts.length > 0) {
        heroFacts.innerHTML = facts.join('');
        heroFacts.classList.remove('hidden');
    } else {
        heroFacts.classList.add('hidden');
    }

    if (tags.length > 0) {
        heroTags.innerHTML = tags.map((tag) => `<span>${tag}</span>`).join('');
        heroTags.classList.remove('hidden');
    } else {
        heroTags.innerHTML = '';
        heroTags.classList.add('hidden');
    }

    const watchSource = platforms.find((entry) => entry.url) || null;
    const watchLink = watchSource && watchSource.url ? watchSource.url : '';
    if (watchLink) {
        heroWatchButton.href = watchLink;
        heroWatchButton.classList.remove('hidden');
    } else {
        heroWatchButton.classList.add('hidden');
        heroWatchButton.removeAttribute('href');
    }

    heroWatchButton.onclick = (event) => {
        if (!watchLink) {
            event.preventDefault();
        }
    };

    heroDetailsButton.onclick = () => openDetailModal(video);
}

function renderAgeSections(videos) {
    ageSections.innerHTML = '';

    AGE_BRACKETS.forEach((bracket) => {
        const filteredVideos = videos.filter((video) => {
            const age = getAge(video);
            return age >= bracket.min && age <= bracket.max;
        });

        if (filteredVideos.length === 0) {
            return;
        }

        const section = document.createElement('section');
        section.className = 'space-y-4';
        section.setAttribute('data-age-section', bracket.id);

        section.innerHTML = `
            <div class="age-section-header">
                <div>
                    <h3>${escapeHtml(bracket.title)}</h3>
                    <p>${escapeHtml(bracket.description)}</p>
                </div>
            </div>
        `;

        const row = document.createElement('div');
        row.className = 'series-row';

        filteredVideos.forEach((video) => {
            const card = createSeriesCard(video);
            row.appendChild(card);
        });

        section.appendChild(row);
        ageSections.appendChild(section);
    });
}

function createSeriesCard(video) {
    const card = document.createElement('article');
    card.className = 'series-card';
    card.dataset.videoId = String(video.id || '');
    card.addEventListener('click', () => openDetailModal(video));

    const safeTitle = escapeHtml(video.title || 'Unbenannte Serie');
    const rawSummary = video.summary || 'Noch keine Beschreibung vorhanden.';
    const cardSummary = escapeHtml(truncateText(rawSummary, 140));
    const tags = extractSafeTags(video.tags).slice(0, 4);
    const age = getAge(video);
    const previewMedia = createCardPreviewMarkup(video, safeTitle);
    const platformBadges = buildPlatformBadges(video);

    const adminControlsHtml = loggedIn
        ? `
            <div class="admin-controls">
                <button type="button" class="admin-button edit" title="Bearbeiten">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5h2m6.414 1.586a2 2 0 010 2.828l-7.778 7.778a2 2 0 01-1.006.535l-3.49.698a1 1 0 01-1.176-1.176l.698-3.49a2 2 0 01.535-1.006l7.778-7.778a2 2 0 012.828 0z"/>
                    </svg>
                </button>
                <button type="button" class="admin-button delete" title="Löschen">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-3h4a1 1 0 011 1v2H9V5a1 1 0 011-1zM4 7h16"/>
                    </svg>
                </button>
            </div>
        `
        : '';

    card.innerHTML = `
        ${adminControlsHtml}
        <div class="preview-wrapper">
            ${previewMedia}
            <div class="preview-overlay">
                <span class="age-badge">Ab ${age} J.</span>
                ${platformBadges}
            </div>
        </div>
        <div class="info">
            <div class="title-row">
                <h4>${safeTitle}</h4>
            </div>
            <p>${cardSummary}</p>
            ${tags.length > 0 ? `<div class="tags">${tags.map((tag) => `<span>${tag}</span>`).join('')}</div>` : ''}
        </div>
    `;

    if (loggedIn) {
        const editButton = card.querySelector('.admin-button.edit');
        const deleteButton = card.querySelector('.admin-button.delete');

        if (editButton) {
            editButton.addEventListener('click', (event) => {
                event.stopPropagation();
                openFormModal(video);
            });
        }

        if (deleteButton) {
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteVideo(video.id);
            });
        }
    }

    return card;
}

function createHeroMediaMarkup(video, safeTitle) {
    const previewUrl = (video.previewUrl || '').trim();
    const posterUrl = resolvePosterUrl(video);

    if (previewUrl) {
        if (isYouTubeUrl(previewUrl)) {
            const embedUrl = buildYouTubeEmbedUrl(previewUrl, { autoplay: 1, mute: 1, loop: 1, controls: 0 });
            if (embedUrl) {
                return `<iframe src="${embedUrl}" title="Vorschau ${safeTitle}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen loading="lazy"></iframe>`;
            }
        } else if (isDirectVideoFile(previewUrl)) {
            const posterAttribute = posterUrl ? ` poster="${escapeAttribute(posterUrl)}"` : '';
            return `<video src="${escapeAttribute(previewUrl)}" autoplay muted loop playsinline${posterAttribute}></video>`;
        }
    }

    if (posterUrl) {
        return `<img src="${escapeAttribute(posterUrl)}" alt="Poster ${safeTitle}" class="hero-poster">`;
    }

    return `<div class="h-full w-full flex items-center justify-center text-slate-400 text-sm bg-slate-900">Keine Vorschau vorhanden</div>`;
}

function createCardPreviewMarkup(video, safeTitle) {
    const posterUrl = resolvePosterUrl(video);
    const previewUrl = (video.previewUrl || '').trim();
    const parts = [`<img src="${escapeAttribute(posterUrl)}" alt="Poster ${safeTitle}">`];

    if (previewUrl && isDirectVideoFile(previewUrl)) {
        parts.push(`<video src="${escapeAttribute(previewUrl)}" muted loop playsinline preload="metadata"></video>`);
    }

    return parts.join('');
}

function openFormModal(video = null) {
    videoForm.reset();
    document.getElementById('videoId').value = '';

    if (video) {
        formModalTitle.textContent = 'Serie bearbeiten';
        document.getElementById('videoId').value = video.id || '';
        document.getElementById('videoTitle').value = video.title || '';
        document.getElementById('posterUrl').value = video.posterUrl || '';
        document.getElementById('previewUrl').value = video.previewUrl || '';
        document.getElementById('trailerUrl').value = video.trailerUrl || '';
        document.getElementById('age').value = video.age || '';
        document.getElementById('platform').value = video.platform || '';
        document.getElementById('platformUrl').value = video.platformUrl || '';
        document.getElementById('platformLogo').value = video.platformLogo || '';
        document.getElementById('firstAired').value = video.firstAired || '';
        document.getElementById('imdbRating').value = video.imdbRating || '';
        document.getElementById('tags').value = video.tags || '';
        document.getElementById('summary').value = video.summary || '';
        document.getElementById('watchHint').value = video.watchHint || '';
        if (additionalPlatformsInput) {
            additionalPlatformsInput.value = formatAdditionalPlatformsForForm(video);
        }
    } else {
        formModalTitle.textContent = 'Neue Serie';
        if (additionalPlatformsInput) {
            additionalPlatformsInput.value = '';
        }
    }

    formModal.classList.remove('hidden');
    formModal.classList.add('flex');
}

function closeFormModal() {
    formModal.classList.add('hidden');
    formModal.classList.remove('flex');
}

function openDetailModal(video) {
    const safeTitle = escapeHtml(video.title || 'Unbenannte Serie');
    const summary = escapeHtml(video.summary || 'Noch keine Beschreibung vorhanden.');
    const fullTags = extractSafeTags(video.tags);
    const age = getAge(video);
    const platforms = normalizePlatformEntries(video);
    const primaryPlatform = platforms[0] || null;
    const platformName = primaryPlatform && primaryPlatform.name ? escapeHtml(primaryPlatform.name) : '';
    const posterUrl = resolvePosterUrl(video);
    const posterMarkup = posterUrl ? `<img src="${escapeAttribute(posterUrl)}" alt="Poster ${safeTitle}">` : '';
    const streamingCallouts = createStreamingCallouts(video);
    const detailTags = fullTags.length
        ? `<div class="hero-tags mt-6">${fullTags.map((tag) => `<span>${tag}</span>`).join('')}</div>`
        : '';

    const metaItems = [
        `Empfohlen ab ${age} Jahren`
    ];

    if (video.firstAired) {
        metaItems.push(`Erstausstrahlung ${escapeHtml(String(video.firstAired))}`);
    }

    if (video.imdbRating) {
        metaItems.push(`IMDb ${escapeHtml(String(video.imdbRating))}`);
    }

    const trailerMarkup = createTrailerMarkup(video, safeTitle);

    detailModalContent.innerHTML = `
        <section class="detail-hero">
            ${posterMarkup}
            <div class="detail-hero-content">
                <div class="hero-meta-row">
                    <span class="hero-age">Ab ${age} Jahren</span>
                    ${platformName ? `<span class="hero-platform">${platformName}</span>` : ''}
                </div>
                <h2 class="hero-title">${safeTitle}</h2>
                <p class="hero-summary">${summary}</p>
                ${detailTags}
            </div>
        </section>
        <section class="detail-body">
            <div>
                <h3>Darum geht's</h3>
                <p class="text-slate-300 leading-relaxed">${summary}</p>
                <div class="detail-meta mt-6">
                    ${metaItems.map((item) => `<span>${item}</span>`).join('')}
                </div>
            </div>
            <aside class="space-y-6">
                ${streamingCallouts}
                ${trailerMarkup ? `<div><h3>Trailer</h3><div class="detail-trailer">${trailerMarkup}</div></div>` : ''}
            </aside>
        </section>
    `;

    detailModal.classList.remove('hidden');
    detailModal.classList.add('flex');
}

function closeDetailModal() {
    detailModal.classList.add('hidden');
    detailModal.classList.remove('flex');
    detailModalContent.innerHTML = '';
}

function createStreamingCallouts(video) {
    const platforms = normalizePlatformEntries(video);
    if (platforms.length === 0) {
        return '';
    }

    const cards = platforms.map((platform) => createStreamingCalloutCard(platform));
    return `<div class="streaming-callout-list">${cards.join('')}</div>`;
}

function createStreamingCalloutCard(platform) {
    const displayName = platform.name ? escapeHtml(platform.name) : 'Streaming-Plattform';
    const descriptionText = platform.hint
        ? platform.hint
        : platform.url
            ? `Mit einem Klick geht es zu ${platform.name || 'der Plattform'}.`
            : 'Frag Mama oder Papa, wo du die Serie schauen kannst.';
    const description = escapeHtml(descriptionText);

    const logoMarkup = platform.logo
        ? `<img src="${escapeAttribute(platform.logo)}" alt="${displayName} Logo" class="platform-logo">`
        : '';

    const linkMarkup = platform.url
        ? `<a href="${escapeAttribute(platform.url)}" target="_blank" rel="noopener noreferrer" class="watch-link">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6V4z"/></svg>
                Auf ${displayName} schauen
            </a>`
        : '';

    const hintMarkup = !linkMarkup && platform.hint
        ? `<span class="platform-hint">${escapeHtml(platform.hint)}</span>`
        : '';

    const classes = ['streaming-callout'];
    if (!platform.primary) {
        classes.push('streaming-callout--secondary');
    }

    return `
        <div class="${classes.join(' ')}">
            <div class="flex items-center gap-4">
                ${logoMarkup}
                <div>
                    <strong>${displayName}</strong>
                    <p class="text-slate-300 text-sm">${description}</p>
                </div>
            </div>
            <div class="streaming-actions">
                ${linkMarkup}
                ${hintMarkup}
            </div>
        </div>
    `;
}

function createTrailerMarkup(video, safeTitle) {
    const trailerCandidate = (video.trailerUrl || video.previewUrl || '').trim();
    const posterUrl = resolvePosterUrl(video);
    const posterAttribute = posterUrl ? ` poster="${escapeAttribute(posterUrl)}"` : '';

    if (!trailerCandidate) {
        return '';
    }

    if (isYouTubeUrl(trailerCandidate)) {
        const embedUrl = buildYouTubeEmbedUrl(trailerCandidate, { autoplay: 0, mute: 0, loop: 0, controls: 1 });
        if (embedUrl) {
            return `<iframe src="${embedUrl}" title="Trailer ${safeTitle}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
        }
    }

    if (isDirectVideoFile(trailerCandidate)) {
        return `<video src="${escapeAttribute(trailerCandidate)}" controls playsinline${posterAttribute}></video>`;
    }

    return '';
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
        alert('Ein Fehler ist aufgetreten: ' + error.message);
    }
});

async function deleteVideo(id) {
    if (!id) {
        return;
    }

    if (!confirm('Bist du sicher, dass du diese Serie löschen möchtest?')) {
        return;
    }

    try {
        const response = await fetch(`./api/videos_api.php?id=${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (result.status === 'success') {
            fetchVideos();
        } else {
            alert('Fehler beim Löschen: ' + result.message);
        }
    } catch (error) {
        alert('Ein Fehler ist aufgetreten: ' + error.message);
    }
}

async function checkLoginStatus() {
    try {
        const response = await fetch('./api/check_login.php');
        const data = await response.json();
        loggedIn = Boolean(data.loggedIn);
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

function formatAdditionalPlatformsForForm(video) {
    if (!video) {
        return '';
    }

    const entries = extractAdditionalPlatformValues(video);
    if (entries.length === 0) {
        return '';
    }

    return entries
        .map((entry) => {
            const parts = [];
            if (entry.name) {
                parts.push(entry.name);
            }
            if (entry.url) {
                parts.push(entry.url);
            }
            if (entry.logo) {
                parts.push(entry.logo);
            }
            if (entry.hint) {
                parts.push(entry.hint);
            }
            return parts.join('|');
        })
        .join('\n');
}

function normalizePlatformEntries(video) {
    const entries = [];
    const seen = new Set();

    const baseEntry = normalizePlatformEntry({
        name: typeof video.platform === 'string' ? video.platform : '',
        url: typeof video.platformUrl === 'string' ? video.platformUrl : '',
        logo: typeof video.platformLogo === 'string' ? video.platformLogo : '',
        hint: typeof video.watchHint === 'string' ? video.watchHint : ''
    });

    if (baseEntry) {
        baseEntry.logo = resolvePlatformLogoByName(baseEntry.name, baseEntry.logo);
        baseEntry.primary = true;
        const signature = buildPlatformSignature(baseEntry.name, baseEntry.url);
        seen.add(signature);
        entries.push(baseEntry);
    }

    const additionalEntries = extractAdditionalPlatformValues(video);
    additionalEntries.forEach((entry) => {
        const signature = buildPlatformSignature(entry.name, entry.url);
        if (seen.has(signature)) {
            return;
        }
        entry.primary = entries.length === 0;
        seen.add(signature);
        entries.push(entry);
    });

    if (entries.length > 0) {
        entries[0].primary = true;
        for (let index = 1; index < entries.length; index += 1) {
            entries[index].primary = false;
        }
    }

    return entries;
}

function buildPlatformSignature(name, url) {
    const normalizedName = (name || '').trim().toLowerCase();
    const normalizedUrl = (url || '').trim().toLowerCase();
    return `${normalizedName}|${normalizedUrl}`;
}

function extractAdditionalPlatformValues(video) {
    const candidates = [
        video.additionalPlatforms,
        video.morePlatforms,
        video.otherPlatforms,
        video.platforms
    ];

    const uniqueEntries = new Map();

    candidates.forEach((candidate) => {
        const parsed = parseAdditionalPlatformPayload(candidate);
        parsed.forEach((entry) => {
            const normalized = normalizePlatformEntry(entry);
            if (!normalized) {
                return;
            }
            normalized.logo = resolvePlatformLogoByName(normalized.name, normalized.logo);
            const signature = buildPlatformSignature(normalized.name, normalized.url);
            if (!uniqueEntries.has(signature)) {
                uniqueEntries.set(signature, normalized);
            }
        });
    });

    return Array.from(uniqueEntries.values());
}

function parseAdditionalPlatformPayload(value) {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value.flatMap((item) => parseAdditionalPlatformPayload(item));
    }

    if (typeof value === 'object') {
        if (value === null) {
            return [];
        }
        if ('name' in value || 'url' in value || 'logo' in value || 'hint' in value) {
            return [value];
        }
        return Object.keys(value).map((key) => ({
            name: key,
            url: typeof value[key] === 'string' ? value[key] : ''
        }));
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return [];
        }

        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                const parsedJson = JSON.parse(trimmed);
                return parseAdditionalPlatformPayload(parsedJson);
            } catch (error) {
                return [];
            }
        }

        return trimmed
            .split(/\r?\n|;/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line) => {
                const parts = line.split('|').map((part) => part.trim());
                return {
                    name: parts[0] || '',
                    url: parts[1] || '',
                    logo: parts[2] || '',
                    hint: parts[3] || ''
                };
            });
    }

    return [];
}

function normalizePlatformEntry(entry) {
    if (!entry || typeof entry !== 'object') {
        return null;
    }

    const rawName = typeof entry.name === 'string' ? entry.name.trim() : '';
    const rawUrl = typeof entry.url === 'string' ? entry.url.trim() : '';
    const rawLogo = typeof entry.logo === 'string' ? entry.logo.trim() : '';
    const rawHint = typeof entry.hint === 'string' ? entry.hint.trim() : '';

    let name = rawName;
    if (!name) {
        name = deriveDisplayNameFromUrl(rawUrl);
    }

    if (!name && !rawUrl && !rawLogo && !rawHint) {
        return null;
    }

    if (!name) {
        name = 'Streaming-Tipp';
    }

    return {
        name,
        url: rawUrl,
        logo: rawLogo,
        hint: rawHint
    };
}

function deriveDisplayNameFromUrl(url) {
    if (!url) {
        return '';
    }

    try {
        const parsed = new URL(url, window.location.origin);
        const hostname = parsed.hostname.replace(/^www\./i, '');
        const segments = hostname.split('.');
        if (segments.length >= 2) {
            const core = segments[segments.length - 2];
            if (core) {
                return core.charAt(0).toUpperCase() + core.slice(1);
            }
        }
        return hostname;
    } catch (error) {
        return '';
    }
}

function resolvePlatformLogoByName(name, explicitLogo = '') {
    if (explicitLogo) {
        return explicitLogo;
    }
    const key = String(name || '').trim().toLowerCase();
    return PLATFORM_LOGO_MAP[key] || '';
}

function buildPlatformBadges(video) {
    const platforms = normalizePlatformEntries(video);
    if (platforms.length === 0) {
        return '';
    }

    const chips = platforms.slice(0, 2).map((platform) => `<span class="platform-chip">${escapeHtml(platform.name)}</span>`);
    const remaining = platforms.length - chips.length;

    if (remaining > 0) {
        chips.push(`<span class="platform-chip platform-chip--more">+${remaining}</span>`);
    }

    return `<div class="platform-badges">${chips.join('')}</div>`;
}

function resolvePosterUrl(video) {
    if (!video) {
        return generatePosterPlaceholder('');
    }

    const explicitPoster = typeof video.posterUrl === 'string' ? video.posterUrl.trim() : '';
    if (explicitPoster) {
        return explicitPoster;
    }

    const previewCandidates = [
        typeof video.previewUrl === 'string' ? video.previewUrl.trim() : '',
        typeof video.trailerUrl === 'string' ? video.trailerUrl.trim() : ''
    ];

    for (let index = 0; index < previewCandidates.length; index += 1) {
        const candidate = previewCandidates[index];
        if (!candidate) {
            continue;
        }
        if (isYouTubeUrl(candidate)) {
            const videoId = extractYouTubeId(candidate);
            if (videoId) {
                return buildYouTubeThumbnailUrl(videoId);
            }
        }
    }

    return generatePosterPlaceholder(video.title || '');
}

function buildYouTubeThumbnailUrl(videoId) {
    return `${YOUTUBE_THUMBNAIL_BASE}${videoId}/hqdefault.jpg`;
}

function generatePosterPlaceholder(title) {
    const rawTitle = (title || 'Serie').trim();
    const cacheKey = rawTitle.toLowerCase();

    if (posterPlaceholderCache.has(cacheKey)) {
        return posterPlaceholderCache.get(cacheKey);
    }

    const initials = getInitialsFromTitle(rawTitle);
    const [startColor, endColor] = selectPlaceholderColors(cacheKey);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${startColor}"/><stop offset="100%" stop-color="${endColor}"/></linearGradient></defs><rect width="1600" height="900" fill="url(%23grad)"/><text x="50%" y="52%" text-anchor="middle" fill="#f8fafc" font-size="360" font-family="Inter, Arial, Helvetica, sans-serif" font-weight="700" letter-spacing="12">${initials}</text></svg>`;
    const dataUri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

    posterPlaceholderCache.set(cacheKey, dataUri);
    return dataUri;
}

function getInitialsFromTitle(title) {
    if (!title) {
        return 'TV';
    }

    const normalized = title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ' ')
        .trim();

    const words = normalized.split(/\s+/).filter((word) => word.length > 0);
    const letters = words.slice(0, 2).map((word) => word.charAt(0)).join('');
    const sanitized = letters.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (sanitized) {
        return sanitized;
    }

    const fallback = normalized.replace(/[^A-Z0-9]/gi, '').slice(0, 2).toUpperCase();
    return fallback || 'TV';
}

function selectPlaceholderColors(seed) {
    if (!Array.isArray(PLACEHOLDER_GRADIENTS) || PLACEHOLDER_GRADIENTS.length === 0) {
        return ['#1e293b', '#0f172a'];
    }

    const normalizedSeed = (seed || 'default').toLowerCase();
    let hash = 0;

    for (let index = 0; index < normalizedSeed.length; index += 1) {
        hash = (hash * 31 + normalizedSeed.charCodeAt(index)) & 0xffffffff;
    }

    const position = Math.abs(hash) % PLACEHOLDER_GRADIENTS.length;
    return PLACEHOLDER_GRADIENTS[position];
}

function getAge(video) {
    const value = Number(video.age);
    if (Number.isNaN(value) || value < 0) {
        return 0;
    }
    return value;
}

function truncateText(value, length) {
    if (!value) {
        return '';
    }
    if (value.length <= length) {
        return value;
    }
    return `${value.substring(0, length - 1)}…`;
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

function getPlatformLogo(video) {
    return resolvePlatformLogoByName(video.platform, video.platformLogo);
}

function isYouTubeUrl(url) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
}

function isDirectVideoFile(url) {
    return /\.(mp4|webm|ogg|ogv)$/i.test(url);
}

function extractYouTubeId(url) {
    const cleanedUrl = url.trim();
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = cleanedUrl.match(regex);
    if (match && match[1]) {
        return match[1];
    }

    const urlObj = (() => {
        try {
            return new URL(cleanedUrl, window.location.origin);
        } catch (error) {
            return null;
        }
    })();

    if (!urlObj) {
        return '';
    }

    if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v') || '';
    }

    if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.replace('/', '');
    }

    return '';
}

function buildYouTubeEmbedUrl(url, options = {}) {
    const videoId = extractYouTubeId(url);
    if (!videoId) {
        return '';
    }

    const defaults = {
        autoplay: 0,
        mute: 0,
        loop: 0,
        controls: 1
    };
    const settings = { ...defaults, ...options };

    const params = new URLSearchParams();
    params.set('autoplay', settings.autoplay ? '1' : '0');
    params.set('mute', settings.mute ? '1' : '0');
    params.set('loop', settings.loop ? '1' : '0');
    params.set('controls', settings.controls ? '1' : '0');
    params.set('rel', '0');
    params.set('playsinline', '1');
    params.set('modestbranding', '1');

    if (settings.loop) {
        params.set('playlist', videoId);
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
}

document.addEventListener('DOMContentLoaded', checkLoginStatus);
