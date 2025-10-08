document.addEventListener('DOMContentLoaded', () => {

    /**
     * V3.3: Diese Funktion injiziert eine komplett neue, ultra-moderne Stil-Palette.
     * Enthält permanentes Leuchten für erfolgreiche Platzierungen und eine intelligente Header-Steuerung mit Dashboard-Link.
     */
    function injectDynamicStyles() {
        if (document.getElementById('dynamic-game-styles')) return;

        const style = document.createElement('style');
        style.id = 'dynamic-game-styles';
        style.innerHTML = `
            /* Ultra-modernes Menü-Design */
            #game-menu .menu-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; padding-top: 2rem; perspective: 1500px; }
            .game-select-card { position: relative; width: 280px; height: 350px; background: rgba(31, 41, 55, 0.5); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; transform-style: preserve-3d; transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.5s ease; cursor: pointer; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
            .game-select-card:before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 20px; background: radial-gradient(80% 80% at 50% 50%, rgba(167, 139, 250, 0.2), transparent); opacity: 0; transition: opacity 0.5s ease; }
            .game-select-card:hover { transform: rotateY(15deg) scale(1.05); border-color: rgba(167, 139, 250, 0.8); }
            .game-select-card:hover:before { opacity: 1; }
            .card-content { position: relative; z-index: 1; padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 100%; transform: translateZ(40px); }
            .card-icon { font-size: 5rem; line-height: 1; filter: drop-shadow(0 0 10px rgba(0,0,0,0.5)); }
            .card-title { font-size: 1.75rem; font-weight: 700; margin-top: 1.5rem; color: #fff; }
            .card-description { font-size: 1rem; color: #d1d5db; margin-top: 0.5rem; }
            
            /* Stile für die Spiele selbst */
            #shape-game-container { perspective: 1000px; }
            @keyframes magic-sparkle-burst { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
            .sparkle-particle { position: absolute; width: 10px; height: 10px; background: #bef264; border-radius: 50%; pointer-events: none; animation: magic-sparkle-burst 0.7s ease-out forwards; box-shadow: 0 0 5px #fff, 0 0 10px #bef264, 0 0 15px #86efac; }
            .shape-piece { transform-style: preserve-3d; transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.2s ease; box-shadow: 0px 5px 15px rgba(0,0,0,0.2), 0px 2px 5px rgba(0,0,0,0.1); transform: rotateX(20deg) rotateY(0deg) translateZ(10px); }
            .shape-piece:hover { transform: rotateX(10deg) rotateY(0deg) translateZ(30px) scale(1.05); box-shadow: 0px 15px 30px rgba(0,0,0,0.3), 0px 8px 15px rgba(0,0,0,0.2); }
            .shape-piece.dragging { z-index: 1000; transform: rotateX(0deg) rotateY(0deg) translateZ(100px) scale(1.1); box-shadow: 0px 25px 50px rgba(0,0,0,0.4), 0px 15px 30px rgba(0,0,0,0.3); }
            .shape-target { transition: background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; box-shadow: inset 0px 4px 8px rgba(0,0,0,0.3); }
            .target-filled { box-shadow: none !important; border-style: solid !important; }

            /* Keyframes für das permanente Leuchten */
            @keyframes breathing-glow {
                0% { box-shadow: 0 0 15px 5px rgba(190, 242, 100, 0.5); }
                50% { box-shadow: 0 0 30px 10px rgba(190, 242, 100, 0.8); }
                100% { box-shadow: 0 0 15px 5px rgba(190, 242, 100, 0.5); }
            }

            /* Klasse für das permanente Leuchten */
            .target-success-glow {
                animation: breathing-glow 2s ease-in-out infinite;
            }

            #success-overlay h2 { animation: scale-in-out 1.5s ease-in-out infinite; }
            @keyframes scale-in-out { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
            .shape-dreieck { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
            .shape-herz { clip-path: path('M10,30 A20,20,0,0,1,50,30 A20,20,0,0,1,90,30 Q90,60,50,90 Q10,60,10,30 Z'); }
            .shape-raute { clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%); }
        `;
        document.head.appendChild(style);
    }
    
    // --- Hilfsfunktion zum Umwandeln von Hex-Farben in RGBA ---
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // --- DATENBANKEN für die Spiele ---
    const tiere = [ { name: 'Hund', image: 'assets/images/hund.png', sound: 'assets/sounds/hund.mp3' }, { name: 'Katze', image: 'assets/images/katze.png', sound: 'assets/sounds/katze.mp3' }, { name: 'Kuh', image: 'assets/images/kuh.png', sound: 'assets/sounds/kuh.mp3' }, { name: 'Pferd', image: 'assets/images/pferd.png', sound: 'assets/sounds/pferd.mp3' }, { name: 'Schaf', image: 'assets/images/schaf.png', sound: 'assets/sounds/schaf.mp3' }, { name: 'Frosch', image: 'assets/images/frosch.png', sound: 'assets/sounds/frosch.mp3' }, { name: 'Elefant', image: 'assets/images/elefant.png', sound: 'assets/sounds/elefant.mp3' }, { name: 'Löwe', image: 'assets/images/loewe.png', sound: 'assets/sounds/loewe.mp3' } ];
    const fahrzeuge = [ { name: 'Auto', image: 'assets/images/auto.png', sound: 'assets/sounds/auto.mp3' }, { name: 'Feuerwehrauto', image: 'assets/images/feuerwehrauto.png', sound: 'assets/sounds/feuerwehrauto.mp3' }, { name: 'Traktor', image: 'assets/images/traktor.png', sound: 'assets/sounds/traktor.mp3' }, { name: 'Flugzeug', image: 'assets/images/flugzeug.png', sound: 'assets/sounds/flugzeug.mp3' }, ];
    const allShapes = [ { name: 'Kreis', type: 'kreis', color: '#3b82f6', sound: 'assets/sounds/plopp.mp3' }, { name: 'Quadrat', type: 'quadrat', color: '#22c55e', sound: 'assets/sounds/plopp.mp3' }, { name: 'Stern', type: 'stern', color: '#ef4444', sound: 'assets/sounds/plopp.mp3' }, { name: 'Dreieck', type: 'dreieck', color: '#f97316', sound: 'assets/sounds/plopp.mp3' }, { name: 'Herz', type: 'herz', color: '#ec4899', sound: 'assets/sounds/plopp.mp3' }, { name: 'Raute', type: 'raute', color: '#8b5cf6', sound: 'assets/sounds/plopp.mp3' }, ];
    const shapeLevels = { 1: ['Kreis', 'Quadrat', 'Stern'], 2: ['Kreis', 'Quadrat', 'Stern', 'Dreieck'], 3: ['Kreis', 'Quadrat', 'Stern', 'Dreieck', 'Herz', 'Raute'] };

    // --- Globale Zustände ---
    let currentQuizSet = null, isQuizMode = false, currentQuizItem = null, matchedShapes = 0, currentShapesInLevel = [];

    // --- DOM-Elemente ---
    const gameMenu = document.getElementById('game-menu'), gameView = document.getElementById('game-view'), gameHeader = document.getElementById('game-header'), backToMenuButton = document.getElementById('back-to-menu'), backToDashboardButton = document.getElementById('back-to-dashboard'), gameTitle = document.getElementById('game-title'), instructionText = document.getElementById('instruction-text'), tippGameBoard = document.getElementById('tipp-game-board'), shapeGameContainer = document.getElementById('shape-game-container'), shapeTargetsContainer = document.getElementById('shape-targets'), shapePiecesContainer = document.getElementById('shape-pieces'), quizButton = document.getElementById('quiz-button'), successOverlay = document.getElementById('success-overlay'), playAgainButton = document.getElementById('play-again-button');

    // --- Allgemeine Funktionen ---
    function speak(text) { window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'de-DE'; utterance.rate = 0.9; window.speechSynthesis.speak(utterance); }
    
    function initializeModernMenu() {
        const games = [ { id: 'tiere', icon: '🐾', title: 'Tier-Geräusche', description: 'Erkenne die Laute der Tiere' }, { id: 'fahrzeuge', icon: '🚗', title: 'Fahrzeug-Geräusche', description: 'Höre die Motoren und Sirenen' }, { id: 'formen', icon: '🧩', title: 'Formen-Spiel', description: 'Ziehe die Teile an den richtigen Platz' } ];
        const menuContainer = document.createElement('div');
        menuContainer.className = 'menu-container';
        gameMenu.innerHTML = ''; // Leert das alte Menü
        games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-select-card';
            card.dataset.game = game.id;
            card.innerHTML = `<div class="card-content"><div class="card-icon">${game.icon}</div><h3 class="card-title">${game.title}</h3><p class="card-description">${game.description}</p></div>`;
            card.addEventListener('click', () => selectGame(game.id));
            menuContainer.appendChild(card);
        });
        gameMenu.appendChild(menuContainer);
    }

    // --- Spiel-Navigations-Logik (VERBESSERT) ---
    function updateHeader(mode, title = '') {
        gameHeader.classList.remove('hidden');
        if (mode === 'menu') {
            gameTitle.textContent = "Leo's Lernwelt";
            backToMenuButton.classList.add('hidden');
            backToDashboardButton.classList.remove('hidden');
        } else {
            gameTitle.textContent = title;
            backToMenuButton.classList.remove('hidden');
            backToDashboardButton.classList.add('hidden');
        }
    }
    
    backToMenuButton.addEventListener('click', () => { 
        gameView.classList.add('hidden'); 
        gameMenu.classList.remove('hidden'); 
        isQuizMode = false; 
        updateHeader('menu');
    });

    function selectGame(gameType) {
        gameMenu.classList.add('hidden');
        gameView.classList.remove('hidden');
        tippGameBoard.classList.add('hidden');
        shapeGameContainer.classList.add('hidden');
        quizButton.classList.add('hidden');
        
        if (gameType === 'tiere') { 
            updateHeader('game', 'Tier-Geräusche');
            instructionText.textContent = 'Tippe auf ein Tier, um sein Geräusch zu hören.'; 
            tippGameBoard.classList.remove('hidden'); 
            quizButton.classList.remove('hidden'); 
            setupTippspiel(tiere); 
        } else if (gameType === 'fahrzeuge') { 
            updateHeader('game', 'Fahrzeug-Geräusche');
            instructionText.textContent = 'Tippe auf ein Fahrzeug, um sein Geräusch zu hören.'; 
            tippGameBoard.classList.remove('hidden'); 
            quizButton.classList.remove('hidden'); 
            setupTippspiel(fahrzeuge); 
        } else if (gameType === 'formen') { 
            updateHeader('game', 'Formen erkennen');
            shapeGameContainer.classList.remove('hidden'); 
            showFormenLevelSelector(); 
        }
    }

    // --- LOGIK FÜR DAS TIPPSPIEL ---
    function setupTippspiel(items) { currentQuizSet = items; isQuizMode = false; quizButton.textContent = 'Starte das Quiz!'; tippGameBoard.innerHTML = ''; items.forEach(item => { const card = document.createElement('div'); card.className = 'item-card rounded-2xl p-4 flex items-center justify-center'; card.addEventListener('click', () => handleTippCardClick(item, card)); const img = document.createElement('img'); img.src = item.image; img.alt = item.name; img.className = 'w-full h-auto object-cover rounded-lg select-none'; card.appendChild(img); tippGameBoard.appendChild(card); }); }
    function handleTippCardClick(item, cardElement) { if (isQuizMode) { if (item.name === currentQuizItem.name) { speak('Super!'); cardElement.classList.add('correct'); new Audio(item.sound).play(); setTimeout(() => { cardElement.classList.remove('correct'); startQuiz(); }, 2000); } else { speak('Das ist nicht richtig.'); cardElement.classList.add('wrong'); setTimeout(() => cardElement.classList.remove('wrong'), 1000); } } else { speak(`Das ist ein ${item.name}.`); new Audio(item.sound).play(); } }
    quizButton.addEventListener('click', () => { isQuizMode = !isQuizMode; if (isQuizMode) { startQuiz(); } else { quizButton.textContent = 'Starte das Quiz!'; instructionText.textContent = 'Tippe auf ein Objekt, um sein Geräusch zu hören.'; speak('Entdecker-Modus.'); } });
    function startQuiz() { quizButton.textContent = 'Quiz beenden'; currentQuizItem = currentQuizSet[Math.floor(Math.random() * currentQuizSet.length)]; instructionText.textContent = `Wo ist: ${currentQuizItem.name}?`; speak(`Wo ist ${currentQuizItem.name}?`); }

    // --- LOGIK FÜR DAS FORMEN-SPIEL ---
    function showFormenLevelSelector() {
        shapePiecesContainer.innerHTML = ''; shapeTargetsContainer.innerHTML = ''; instructionText.textContent = 'Wähle ein Level aus.';
        const levelContainer = document.createElement('div'); levelContainer.className = 'flex justify-center items-center gap-4 h-full';
        Object.keys(shapeLevels).forEach(level => { const button = document.createElement('button'); button.className = 'bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-10 rounded-2xl text-2xl transition-transform duration-200 hover:scale-105'; button.textContent = `Level ${level}`; button.onclick = () => startFormenspiel(level); levelContainer.appendChild(button); });
        shapePiecesContainer.appendChild(levelContainer);
    }
    function startFormenspiel(level) {
        const shapeNames = shapeLevels[level]; currentShapesInLevel = allShapes.filter(s => shapeNames.includes(s.name));
        instructionText.textContent = 'Ziehe die bunten Formen in die passenden Lücken.'; setupFormenspiel();
    }
    function checkOverlap(rect1, rects) { for (const rect2 of rects) { if (!(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom)) { return true; } } return false; }
    function setupFormenspiel() {
        shapePiecesContainer.innerHTML = ''; shapeTargetsContainer.innerHTML = ''; matchedShapes = 0;
        const placedRects = [];
        const containerRect = shapeGameContainer.getBoundingClientRect();
        const elementSize = { width: 100, height: 100 }; const margin = 20;
        currentShapesInLevel.forEach(form => {
            let targetRect;
            do { const top = Math.random() * (containerRect.height - elementSize.height - margin); const left = Math.random() * (containerRect.width - elementSize.width - margin); targetRect = { top, left, right: left + elementSize.width + margin, bottom: top + elementSize.height + margin }; } while (checkOverlap(targetRect, placedRects));
            placedRects.push(targetRect);
            const target = document.createElement('div'); target.className = `shape-target shape-${form.type}`; target.id = `target-${form.name}`; target.style.left = `${targetRect.left}px`; target.style.top = `${targetRect.top}px`; target.style.backgroundColor = hexToRgba(form.color, 0.25); target.style.border = `5px dashed ${form.color}`; shapeTargetsContainer.appendChild(target);
            let pieceRect;
            do { const top = Math.random() * (containerRect.height - elementSize.height - margin); const left = Math.random() * (containerRect.width - elementSize.width - margin); pieceRect = { top, left, right: left + elementSize.width + margin, bottom: top + elementSize.height + margin }; } while (checkOverlap(pieceRect, placedRects));
            placedRects.push(pieceRect);
            const piece = document.createElement('div'); piece.className = `shape-piece shape-${form.type}`; piece.dataset.targetId = target.id; piece.dataset.startX = pieceRect.left; piece.dataset.startY = pieceRect.top; piece.style.backgroundColor = form.color; piece.style.left = `${pieceRect.left}px`; piece.style.top = `${pieceRect.top}px`; shapePiecesContainer.appendChild(piece); makeDraggable(piece);
        });
    }
    function makeDraggable(element) {
        let isDragging = false, offset = { x: 0, y: 0 };
        function onStart(e) { e.preventDefault(); isDragging = true; element.classList.add('dragging'); const rect = element.getBoundingClientRect(); const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX; const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY; offset.x = clientX - rect.left; offset.y = clientY - rect.top; document.addEventListener('mousemove', onMove); document.addEventListener('touchmove', onMove, { passive: false }); document.addEventListener('mouseup', onEnd); document.addEventListener('touchend', onEnd); }
        function onMove(e) { if (!isDragging) return; e.preventDefault(); const parentRect = shapeGameContainer.getBoundingClientRect(); const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX; const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY; let x = clientX - parentRect.left - offset.x; let y = clientY - parentRect.top - offset.y; element.style.left = `${x}px`; element.style.top = `${y}px`; }
        function onEnd() {
            isDragging = false; element.classList.remove('dragging');
            document.removeEventListener('mousemove', onMove); document.removeEventListener('touchmove', onMove); document.removeEventListener('mouseup', onEnd); document.removeEventListener('touchend', onEnd);
            const target = document.getElementById(element.dataset.targetId);
            if (isOverlapping(element, target)) {
                const form = allShapes.find(f => `target-${f.name}` === target.id); if (!form) return;
                const targetRect = target.getBoundingClientRect(); const parentRect = shapeGameContainer.getBoundingClientRect(); element.style.transition = 'all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'; element.style.left = `${targetRect.left - parentRect.left}px`; element.style.top = `${targetRect.top - parentRect.top}px`; element.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)'; element.style.boxShadow = 'none';
                target.classList.add('target-filled');
                target.classList.add('target-success-glow'); // Hinzufügen der Leucht-Klasse
                target.style.backgroundColor = form.color;
                target.style.borderColor = form.color; // Rahmenfarbe anpassen
                for (let i = 0; i < 25; i++) { createSparkle(target); }
                new Audio(form.sound).play(); speak('Passt!'); element.removeEventListener('mousedown', onStart); element.removeEventListener('touchstart', onStart); matchedShapes++;
                if (matchedShapes === currentShapesInLevel.length) { setTimeout(showSuccess, 800); }
            } else { element.style.transition = 'all 0.3s ease'; element.style.left = `${element.dataset.startX}px`; element.style.top = `${element.dataset.startY}px`; element.style.transform = 'rotateX(20deg) rotateY(0deg) translateZ(10px)'; }
        }
        element.addEventListener('mousedown', onStart); element.addEventListener('touchstart', onStart, { passive: false });
    }
    function createSparkle(targetElement) {
        const rect = targetElement.getBoundingClientRect(); const parentRect = shapeGameContainer.getBoundingClientRect();
        const particle = document.createElement('div'); particle.className = 'sparkle-particle';
        const startX = rect.left - parentRect.left + rect.width / 2; const startY = rect.top - parentRect.top + rect.height / 2;
        particle.style.left = `${startX}px`; particle.style.top = `${startY}px`;
        const angle = Math.random() * 2 * Math.PI; const radius = (rect.width / 2) + Math.random() * 40;
        const targetX = startX + radius * Math.cos(angle); const targetY = startY + radius * Math.sin(angle);
        shapeGameContainer.appendChild(particle);
        requestAnimationFrame(() => { particle.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px)`; });
        setTimeout(() => particle.remove(), 700);
    }
    function isOverlapping(el1, el2) { const rect1 = el1.getBoundingClientRect(); const rect2 = el2.getBoundingClientRect(); const overlapThreshold = 0.6; const overlapX = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left)); const overlapY = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top)); const overlapArea = overlapX * overlapY; const smallerArea = Math.min(rect1.width * rect1.height, rect2.width * rect2.height); return overlapArea > smallerArea * overlapThreshold; }
    function showSuccess() { speak('Super gemacht!'); successOverlay.classList.remove('hidden'); }
    playAgainButton.addEventListener('click', () => { successOverlay.classList.add('hidden'); showFormenLevelSelector(); });
    
    // --- Initialisierung ---
    injectDynamicStyles();
    initializeModernMenu();
    updateHeader('menu'); // Setzt den initialen Header-Status
});

