// ========== CANCIONES ==========
const songs = [
    { id: 0, title: "BEBE", artist: "6ix9ine ft. Anuel AA", src: "bebe.mp3", emoji: "🔥", color: "#c77dff" },
    { id: 1, title: "MALA", artist: "6ix9ine", src: "MALA.mp3", emoji: "🌊", color: "#7b2cbf" },
    { id: 2, title: "Debi tirar mas fotos", artist: "Bad Bunny", src: "Dbtmf.mp3", emoji: "🎵", color: "#9d4edd" },
    { id: 3, title: "Armas y fuego", artist: "Chuy Montana", src: "arma.mp3", emoji: "🎤", color: "#c0355a" },
    { id: 4, title: "Mia", artist: "Drake", src: "mia.mp3", emoji: "🎸", color: "#4361ee" },
];

// ========== RECIENTES ==========
const recentItems = [
    { title: "BEBE", subtitle: "6ix9ine ft. Anuel AA", emoji: "🔥", color: "#c77dff", songId: 0 },
    { title: "MALA", subtitle: "6ix9ine", emoji: "🌊", color: "#7b2cbf", songId: 1 },
    { title: "Debi tirar mas fotos", subtitle: "Bad Bunny", emoji: "🎵", color: "#9d4edd", songId: 2 },
    { title: "Armas y fuego", subtitle: "Chuy Montana", emoji: "🎤", color: "#c0355a", songId: 3 },
    { title: "Mia", subtitle: "Drake", emoji: "🎸", color: "#4361ee", songId: 4 },
];

const audio = new Audio();
audio.volume = 0.8;
let currentSong = songs[0];
let isPlaying = false;
const favs = new Set();

// playlists: { name, emoji, color, songIds[] }
const playlists = [];

function $(id) { return document.getElementById(id); }

// ========== VISTAS ==========
function showView(name) {
    document.querySelectorAll('.view-section').forEach(v => v.style.display = 'none');
    const el = $('view-' + name);
    if (el) el.style.display = 'block';
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const nav = document.querySelector(`.nav-item[data-nav="${name}"]`);
    if (nav) nav.classList.add('active');
    if (name === 'library') renderLibrary();
    if (name === 'create') renderCreateView();
}

// ========== SALUDO ==========
function updateGreeting() {
    const hour = new Date().getHours();
    const g = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
    const el = $('greetingText');
    if (el) el.textContent = g;
}

// ========== HOME ==========
function renderRecentGrid() {
    const container = $('recentGrid');
    if (!container) return;
    container.innerHTML = '';
    recentItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'recent-card';
        card.innerHTML = `
            <div class="recent-cover" style="background:linear-gradient(135deg,${item.color},${item.color}80)"><span>${item.emoji}</span></div>
            <div class="recent-info">
                <div class="recent-title">${item.title}</div>
                <div class="recent-sub">${item.subtitle}</div>
            </div>`;
        if (item.songId !== null) card.onclick = () => playSong(songs[item.songId]);
        container.appendChild(card);
    });
}

function renderHorizontalRow(containerId, list) {
    const container = $(containerId);
    if (!container) return;
    container.innerHTML = '';
    list.forEach(song => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-cover" style="background:linear-gradient(135deg,${song.color},${song.color}80)"><span>${song.emoji}</span></div>
            <div class="card-title">${song.title}</div>
            <div class="card-sub">${song.artist}</div>`;
        card.onclick = () => playSong(song);
        container.appendChild(card);
    });
}

// ========== BUSCAR ==========
function doSearch(query) {
    const q = query.trim().toLowerCase();
    const results = $('searchResults');
    const empty = $('searchEmpty');
    const list = $('searchList');
    if (!results) return;

    if (!q) {
        results.style.display = 'none';
        return;
    }
    results.style.display = 'block';

    const found = songs.filter(s =>
        s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    );

    list.innerHTML = '';
    if (!found.length) {
        empty.style.display = 'block';
        empty.querySelector('span').textContent = `Sin resultados para "${query}"`;
        return;
    }
    empty.style.display = 'none';
    found.forEach(song => {
        const row = document.createElement('div');
        row.className = 'lib-row';
        row.innerHTML = `
            <div class="lib-cover" style="background:linear-gradient(135deg,${song.color},${song.color}80)"><span>${song.emoji}</span></div>
            <div class="lib-info">
                <div class="lib-title">${song.title}</div>
                <div class="lib-sub">${song.artist}</div>
            </div>
            <button class="row-play-btn">▶</button>`;
        row.onclick = () => playSong(song);
        list.appendChild(row);
    });
}

// ========== BIBLIOTECA ==========
function renderLibrary() {
    const container = $('libraryList');
    if (!container) return;
    container.innerHTML = '';

    // Playlists creadas
    playlists.forEach((pl, plIdx) => {
        const row = document.createElement('div');
        row.className = 'lib-row';
        row.innerHTML = `
            <div class="lib-cover" style="background:linear-gradient(135deg,${pl.color},${pl.color}80);font-size:26px">${pl.emoji}</div>
            <div class="lib-info">
                <div class="lib-title">${pl.name}</div>
                <div class="lib-sub">${pl.songIds.length} canciones · Playlist</div>
            </div>
            <button class="row-play-btn" onclick="event.stopPropagation();playPlaylist(${plIdx})">▶</button>`;
        row.onclick = () => openPlaylist(plIdx);
        container.appendChild(row);
    });

    // Canciones sueltas
    songs.forEach(s => {
        const row = document.createElement('div');
        row.className = 'lib-row';
        row.innerHTML = `
            <div class="lib-cover" style="background:linear-gradient(135deg,${s.color},${s.color}80)"><span>${s.emoji}</span></div>
            <div class="lib-info">
                <div class="lib-title">${s.title}</div>
                <div class="lib-sub">${s.artist} · Canción</div>
            </div>
            <button class="row-play-btn" onclick="event.stopPropagation();playSong(songs[${s.id}])">▶</button>`;
        row.onclick = () => playSong(s);
        container.appendChild(row);
    });
}

// ========== CREAR PLAYLIST ==========
function renderCreateView() {
    const container = $('createSection');
    if (!container) return;
    container.innerHTML = `
        <!-- Formulario nueva playlist -->
        <div class="create-form">
            <h2>Nueva playlist</h2>
            <input id="plNameInput" class="pl-input" type="text" placeholder="Nombre de la playlist" maxlength="40"/>
            <div class="pl-emoji-row" id="plEmojiRow"></div>
            <button class="create-btn" onclick="submitNewPlaylist()">Crear</button>
        </div>

        <!-- Lista de playlists existentes -->
        <div id="plList"></div>`;

    // emojis para elegir
    const emojis = ['🎵','🔥','❤️','🌊','👑','💿','🎤','🎸','🌙','⚡'];
    const emojiRow = $('plEmojiRow');
    let selectedEmoji = '🎵';
    emojis.forEach(e => {
        const btn = document.createElement('button');
        btn.className = 'emoji-pick';
        btn.textContent = e;
        btn.onclick = () => {
            document.querySelectorAll('.emoji-pick').forEach(b => b.classList.remove('sel'));
            btn.classList.add('sel');
            selectedEmoji = e;
        };
        if (e === selectedEmoji) btn.classList.add('sel');
        emojiRow.appendChild(btn);
    });

    window._getSelectedEmoji = () => selectedEmoji;
    renderPlaylists();
}

function submitNewPlaylist() {
    const input = $('plNameInput');
    const name = input.value.trim();
    if (!name) { input.focus(); input.style.borderColor = '#e05c9e'; return; }
    input.style.borderColor = '';
    const emoji = window._getSelectedEmoji ? window._getSelectedEmoji() : '🎵';
    const colors = ['#9d4edd','#c0355a','#2a6cbf','#7b2cbf','#c77dff'];
    const color = colors[playlists.length % colors.length];
    playlists.push({ name, emoji, color, songIds: [] });
    input.value = '';
    renderPlaylists();
    renderLibrary();
}

function renderPlaylists() {
    const c = $('plList');
    if (!c) return;
    c.innerHTML = playlists.length ? '<h3 style="margin:24px 0 12px;font-size:15px;color:#b3b3b3">Tus playlists</h3>' : '';
    playlists.forEach((pl, i) => {
        const row = document.createElement('div');
        row.className = 'lib-row';
        row.innerHTML = `
            <div class="lib-cover" style="background:linear-gradient(135deg,${pl.color},${pl.color}80);font-size:26px">${pl.emoji}</div>
            <div class="lib-info">
                <div class="lib-title">${pl.name}</div>
                <div class="lib-sub">${pl.songIds.length} canciones</div>
            </div>
            <button class="row-del-btn" onclick="event.stopPropagation();deletePlaylist(${i})" title="Eliminar">🗑</button>`;
        row.onclick = () => openPlaylist(i);
        c.appendChild(row);
    });
}

function deletePlaylist(i) {
    playlists.splice(i, 1);
    renderPlaylists();
    renderLibrary();
}

// ========== VER/EDITAR PLAYLIST ==========
function openPlaylist(plIdx) {
    const pl = playlists[plIdx];
    showView('playlist');
    const container = $('playlistDetail');
    container.innerHTML = `
        <div class="pl-detail-header">
            <div class="pl-detail-cover" style="background:linear-gradient(135deg,${pl.color},${pl.color}80)">${pl.emoji}</div>
            <div>
                <div class="pl-detail-name">${pl.name}</div>
                <div style="color:#b3b3b3;font-size:13px">${pl.songIds.length} canciones</div>
                ${pl.songIds.length ? `<button class="create-btn" style="margin-top:12px;padding:8px 20px;font-size:13px" onclick="playPlaylist(${plIdx})">▶ Reproducir todo</button>` : ''}
            </div>
        </div>
        <h3 style="margin:20px 0 10px;font-size:14px;color:#b3b3b3">Canciones en esta playlist</h3>
        <div id="plSongList"></div>
        <h3 style="margin:20px 0 10px;font-size:14px;color:#b3b3b3">Agregar canciones</h3>
        <div id="plAddList"></div>`;

    renderPlaylistSongs(plIdx);
    renderAddSongs(plIdx);
}

function renderPlaylistSongs(plIdx) {
    const pl = playlists[plIdx];
    const c = $('plSongList');
    if (!c) return;
    c.innerHTML = '';
    if (!pl.songIds.length) {
        c.innerHTML = `<div style="color:#b3b3b3;font-size:13px;padding:8px 0">Aún no hay canciones — agrégalas abajo ↓</div>`;
        return;
    }
    pl.songIds.forEach((sid, pos) => {
        const s = songs.find(x => x.id === sid);
        if (!s) return;
        const row = document.createElement('div');
        row.className = 'lib-row';
        row.innerHTML = `
            <div class="lib-cover" style="background:linear-gradient(135deg,${s.color},${s.color}80)"><span>${s.emoji}</span></div>
            <div class="lib-info"><div class="lib-title">${s.title}</div><div class="lib-sub">${s.artist}</div></div>
            <button class="row-del-btn" onclick="event.stopPropagation();removeSongFromPlaylist(${plIdx},${pos})" title="Quitar">✕</button>`;
        row.onclick = () => playSong(s);
        c.appendChild(row);
    });
}

function renderAddSongs(plIdx) {
    const pl = playlists[plIdx];
    const c = $('plAddList');
    if (!c) return;
    c.innerHTML = '';
    songs.forEach(s => {
        const already = pl.songIds.includes(s.id);
        const row = document.createElement('div');
        row.className = 'lib-row';
        row.innerHTML = `
            <div class="lib-cover" style="background:linear-gradient(135deg,${s.color},${s.color}80)"><span>${s.emoji}</span></div>
            <div class="lib-info"><div class="lib-title">${s.title}</div><div class="lib-sub">${s.artist}</div></div>
            <button class="row-add-btn ${already ? 'added' : ''}" onclick="event.stopPropagation();toggleSongInPlaylist(${plIdx},${s.id})">${already ? '✓' : '+'}</button>`;
        row.onclick = () => playSong(s);
        c.appendChild(row);
    });
}

function toggleSongInPlaylist(plIdx, songId) {
    const pl = playlists[plIdx];
    const pos = pl.songIds.indexOf(songId);
    if (pos === -1) pl.songIds.push(songId);
    else pl.songIds.splice(pos, 1);
    openPlaylist(plIdx); // re-render
    renderLibrary();
}

function removeSongFromPlaylist(plIdx, pos) {
    playlists[plIdx].songIds.splice(pos, 1);
    openPlaylist(plIdx);
    renderLibrary();
}

function playPlaylist(plIdx) {
    const pl = playlists[plIdx];
    if (!pl.songIds.length) return;
    const s = songs.find(x => x.id === pl.songIds[0]);
    if (s) playSong(s);
}

// ========== AUDIO ==========
function playSong(song) {
    currentSong = song;
    audio.src = song.src;
    audio.load();
    ['miniTitle','fullTitle'].forEach(id => $(id).textContent = song.title);
    ['miniArtist','fullArtist'].forEach(id => $(id).textContent = song.artist);
    ['miniCover','fullArt'].forEach(id => {
        $(id).textContent = song.emoji;
        $(id).style.background = `linear-gradient(135deg,${song.color},${song.color}80)`;
    });
    ['fullCurrent','miniDuration'].forEach(id => $(id).textContent = '0:00');
    $('fullTotal').textContent = '0:00';
    isPlaying = true;
    audio.play().catch(e => console.warn(e));
    updatePlayButtons();
}

function togglePlayPause() {
    if (!audio.src) return;
    isPlaying ? audio.pause() : audio.play().catch(e => console.warn(e));
    isPlaying = !isPlaying;
    updatePlayButtons();
}

function nextSong() {
    const idx = songs.findIndex(s => s.id === currentSong.id);
    playSong(songs[(idx + 1) % songs.length]);
}

function prevSong() {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    const idx = songs.findIndex(s => s.id === currentSong.id);
    playSong(songs[(idx - 1 + songs.length) % songs.length]);
}

function updatePlayButtons() {
    const icon = isPlaying ? '⏸' : '▶';
    $('miniPlayBtn').textContent = icon;
    $('fullPlayBtn').textContent = icon;
}

audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    document.querySelectorAll('.progress-fill').forEach(el => el.style.width = pct + '%');
    $('miniDuration').textContent = fmt(audio.currentTime);
    $('fullCurrent').textContent = fmt(audio.currentTime);
});
audio.addEventListener('loadedmetadata', () => { $('fullTotal').textContent = fmt(audio.duration); });
audio.addEventListener('ended', nextSong);

function fmt(s) {
    s = Math.floor(s);
    return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
}

function initProgressBars() {
    document.querySelectorAll('.progress-bar').forEach(bar => {
        bar.addEventListener('click', e => {
            if (!audio.duration) return;
            const r = bar.getBoundingClientRect();
            audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
        });
    });
}

function openPlayer() { $('fullPlayer').classList.add('active'); }
function closePlayer() { $('fullPlayer').classList.remove('active'); }

// ========== INIT ==========
function init() {
    updateGreeting();
    renderRecentGrid();
    renderHorizontalRow('forYouRow', songs);
    renderHorizontalRow('popularRow', [...songs].reverse());
    renderHorizontalRow('albumsRow', songs);
    renderHorizontalRow('fridayRow', songs);
    initProgressBars();

    const s = songs[0];
    ['miniTitle','fullTitle'].forEach(id => $(id).textContent = s.title);
    ['miniArtist','fullArtist'].forEach(id => $(id).textContent = s.artist);
    ['miniCover','fullArt'].forEach(id => {
        $(id).textContent = s.emoji;
        $(id).style.background = `linear-gradient(135deg,${s.color},${s.color}80)`;
    });
    audio.src = s.src;
    showView('home');
}

init();
