/**
 * PINK FLOYD TRIBUTE MUSIC PLAYER APP
 * 
 * NOTA IMPORTANTÍSIMA SOBRE GOOGLE DRIVE:
 * La API web (nombres de carpetas, lectura automática, etc.) no permite listar 
 * el contenido de una carpeta de Google Drive mediante una URL pública si no usamos 
 * la Google Drive API y un Backend/API Key por motivos de CORS (Cross-Origin Resource Sharing).
 * 
 * SOLUCIÓN:
 * He creado una estructura de "bases de datos" estática abajo en JS donde el 
 * propietario deberá colocar los Enlaces Directos (y/o IDs) reales de las canciones e 
 * imágenes de portada alojadas en Google Drive o de cualquier otra URL.
 * 
 * Un enlace directo de Drive se ve así:
 * https://drive.google.com/uc?export=view&id=TU_ID_AQUI
 * O
 * https://drive.usercontent.google.com/download?id=TU_ID_AQUI
 */

const MUSIC_DATA = [
    {
        id: "cd1",
        title: "A Saucerful of Pink - CD 1",
        description: "A Tribute to Pink Floyd (1995)",
        coverArt: "./folder.jpg",
        tracks: [
            { title: "Set Controls For The Heart Of The Sun", url: "./01 - Set Controls For The Heart Of The Sun (Psychic Tv).mp3" },
            { title: "Another Brick In The Wall", url: "./02 - Another Brick In The Wall, Parts 1 & 2 (Controlled Blee.mp3" },
            { title: "One Of These Days", url: "./03 - One Of These Days (Spahn Ranch).mp3" },
            { title: "Wots...uh The Deal", url: "./04 - Wots...uh The Deal (Sky Cries Mary).mp3" },
            { title: "Interstellar Overdrive", url: "./05 - Interstellar Overdrive (Spiral Realms).mp3" },
            { title: "Learning To Fly", url: "./06 - Learning To Fly (Leaether Strip).mp3" },
            { title: "To Roger Waters, Wherever You Are", url: "./07 - To Roger Waters, Wherever You Are (Ron Geesin).mp3" },
            { title: "Jugband Blues", url: "./08 - Jugband Blues (Eden).mp3" },
            { title: "On The Run", url: "./09 - On The Run (Din).mp3" }
        ]
    },
    {
        id: "cd2",
        title: "A Saucerful of Pink - CD 2",
        description: "A Tribute to Pink Floyd (1995)",
        coverArt: "./folder.jpg",
        tracks: [
            { title: "Echoes", url: "./01 - Echoes (Alien Sex Fiend).mp3" },
            { title: "Hey You", url: "./02 - Hey You (Furnace).mp3" },
            { title: "Careful With That Axe, Eugene", url: "./03 - Careful With That Axe, Eugene (Nik Turner).mp3" },
            { title: "Lucifer Sam", url: "./04 - Lucifer Sam (The Electric Hellfire Club).mp3" },
            { title: "Pigs On The Wing", url: "./05 - Pigs On The Wing (Helios Creed).mp3" },
            { title: "Let There Be More Light", url: "./06 - Let There Be More Light (Pressurehed).mp3" },
            { title: "Young Lust", url: "./07 - Young Lust (Penal Colony).mp3" },
            { title: "A Saucerful Of Secrets", url: "./08 - A Saucerful Of Secrets (Exp).mp3" },
            { title: "Point Me At The Sky", url: "./09 - Point Me At The Sky (Melting Euphoria).mp3" },
            { title: "The Nile Song", url: "./10 - The Nile Song (Farflung).mp3" }
        ]
    }
];

// STATE VARIABLES
let currentAlbumIndex = -1;
let currentTrackIndex = 0;
let isPlaying = false;

// DOM Elements
const albumSelectionContainer = document.getElementById("album-selection");
const playlistSection = document.getElementById("playlist-section");
const trackListContainer = document.getElementById("track-list");
const playlistTitle = document.getElementById("playlist-title");
const backBtn = document.getElementById("back-btn");

const audioPlayer = document.getElementById("audio-player");
const playPauseBtn = document.getElementById("play-pause-btn");
const playPauseIcon = playPauseBtn.querySelector("i");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

const nowPlayingCover = document.getElementById("now-playing-cover");
const nowPlayingTitle = document.getElementById("now-playing-title");
const nowPlayingAlbum = document.getElementById("now-playing-album");

const progressBarBg = document.getElementById("progress-bar-bg");
const progressBarFill = document.getElementById("progress-bar-fill");
const currentTimeDisplay = document.getElementById("current-time");
const totalTimeDisplay = document.getElementById("total-time");

const volumeSlider = document.getElementById("volume-slider");
const volumeIcon = document.getElementById("volume-icon");

const errorToast = document.getElementById("error-toast");

// =======================
// INITIALIZATION
// =======================
function init() {
    renderAlbums();
    setupEventListeners();
}

function renderAlbums() {
    albumSelectionContainer.innerHTML = "";
    MUSIC_DATA.forEach((album, index) => {
        const card = document.createElement("div");
        card.className = "album-card";
        card.innerHTML = `
            <img src="${album.coverArt}" alt="${album.title} Cover">
            <h3>${album.title}</h3>
            <p>${album.description || album.tracks.length + ' Canciones'}</p>
        `;
        card.addEventListener("click", () => openAlbum(index));
        albumSelectionContainer.appendChild(card);
    });
}

// =======================
// VIEW NAVIGATION
// =======================
function openAlbum(index) {
    const album = MUSIC_DATA[index];
    playlistTitle.textContent = album.title;

    // Render Tracks
    trackListContainer.innerHTML = "";
    album.tracks.forEach((track, trackIndex) => {
        const item = document.createElement("div");
        item.className = "track-item";

        // Check if viewing album that is currently playing and mark active
        if (currentAlbumIndex === index && currentTrackIndex === trackIndex) {
            item.classList.add("active");
        }

        item.innerHTML = `
            <div class="track-details">
                <span class="track-number">${trackIndex + 1}</span>
                <span class="track-title">${track.title}</span>
            </div>
            <i class="fa-solid fa-play" style="color: var(--text-secondary); font-size: 0.8rem;"></i>
        `;
        item.addEventListener("click", () => loadAndPlay(index, trackIndex));
        trackListContainer.appendChild(item);
    });

    // Toggle views
    albumSelectionContainer.classList.add("hidden");
    playlistSection.classList.remove("hidden");
}

function goBackToAlbums() {
    playlistSection.classList.add("hidden");
    albumSelectionContainer.classList.remove("hidden");
}

// =======================
// PLAYER LOGIC
// =======================
function loadAndPlay(albumIndex, trackIndex) {
    const album = MUSIC_DATA[albumIndex];
    if (!album || !album.tracks[trackIndex]) return;

    const track = album.tracks[trackIndex];
    currentAlbumIndex = albumIndex;
    currentTrackIndex = trackIndex;

    audioPlayer.src = track.url;
    audioPlayer.load();

    // Update UI info
    nowPlayingCover.src = album.coverArt;
    nowPlayingTitle.textContent = track.title;
    nowPlayingAlbum.textContent = album.title;

    // Refresh playlist view if open to show active state
    if (!playlistSection.classList.contains("hidden")) {
        // Find if this album is open, then just re-render internal list
        openAlbum(albumIndex);
    }

    playAudio();
}

function togglePlayPause() {
    if (audioPlayer.src === "" || !audioPlayer.src) return; // No track loaded

    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

function playAudio() {
    audioPlayer.play().then(() => {
        isPlaying = true;
        updatePlayPauseUI();
    }).catch(err => {
        console.error("No se pudo reproducir el archivo.", err);
        showErrorToast();
        pauseAudio();
    });
}

function pauseAudio() {
    audioPlayer.pause();
    isPlaying = false;
    updatePlayPauseUI();
}

function playNext() {
    if (currentAlbumIndex === -1) return;
    const album = MUSIC_DATA[currentAlbumIndex];
    let nextIndex = currentTrackIndex + 1;

    // Continuous loop within the album
    if (nextIndex >= album.tracks.length) {
        nextIndex = 0;
    }

    loadAndPlay(currentAlbumIndex, nextIndex);
}

function playPrevious() {
    if (currentAlbumIndex === -1) return;
    let prevIndex = currentTrackIndex - 1;
    const album = MUSIC_DATA[currentAlbumIndex];

    // Only go to previous if we're near start of song
    if (audioPlayer.currentTime > 3) {
        audioPlayer.currentTime = 0;
        playAudio();
    } else {
        if (prevIndex < 0) {
            prevIndex = album.tracks.length - 1; // loop back to the end
        }
        loadAndPlay(currentAlbumIndex, prevIndex);
    }
}

// =======================
// UI UPDATES
// =======================
function updatePlayPauseUI() {
    if (isPlaying) {
        playPauseIcon.classList.remove("fa-play");
        playPauseIcon.classList.add("fa-pause");
    } else {
        playPauseIcon.classList.remove("fa-pause");
        playPauseIcon.classList.add("fa-play");
    }
}

function updateProgressBar() {
    const duration = audioPlayer.duration;
    const currentTime = audioPlayer.currentTime;

    if (duration > 0) {
        const percent = (currentTime / duration) * 100;
        progressBarFill.style.width = percent + "%";

        currentTimeDisplay.textContent = formatTime(currentTime);
        totalTimeDisplay.textContent = formatTime(duration);
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function setProgress(e) {
    if (audioPlayer.src === "") return;

    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;

    audioPlayer.currentTime = (clickX / width) * duration;
}

function setVolume() {
    audioPlayer.volume = volumeSlider.value;

    if (audioPlayer.volume === 0) {
        volumeIcon.className = "fa-solid fa-volume-xmark";
    } else if (audioPlayer.volume < 0.5) {
        volumeIcon.className = "fa-solid fa-volume-low";
    } else {
        volumeIcon.className = "fa-solid fa-volume-high";
    }
}

function toggleMute() {
    if (audioPlayer.volume > 0) {
        volumeSlider.value = 0;
    } else {
        volumeSlider.value = 1;
    }
    setVolume();
}

function showErrorToast() {
    errorToast.classList.remove("hidden");
    setTimeout(() => {
        errorToast.classList.add("hidden");
    }, 4000);
}

// =======================
// EVENT LISTENERS
// =======================
function setupEventListeners() {
    backBtn.addEventListener("click", goBackToAlbums);

    playPauseBtn.addEventListener("click", togglePlayPause);
    nextBtn.addEventListener("click", playNext);
    prevBtn.addEventListener("click", playPrevious);

    audioPlayer.addEventListener("timeupdate", updateProgressBar);
    audioPlayer.addEventListener("ended", playNext);

    audioPlayer.addEventListener("loadedmetadata", () => {
        totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
    });

    progressBarBg.addEventListener("click", setProgress);
    volumeSlider.addEventListener("input", setVolume);
    volumeIcon.addEventListener("click", toggleMute);
}

// Start
document.addEventListener("DOMContentLoaded", init);
