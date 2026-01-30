let tracks = []; // Will be loaded from database
// DOM ELEMENTS

const elements = {
  // Audio
  audio: document.getElementById("audio-engine"),

  // Player Container
  playerContainer: document.getElementById("player-container"),

  // Player Info
  playerImg: document.getElementById("player-img"),
  playerTrackName: document.getElementById("player-track-name"),
  playerArtistName: document.getElementById("player-artist-name"),
  likeBtn: document.getElementById("like-btn"),

  // Controls
  playBtn: document.getElementById("play-btn"),
  prevBtn: document.getElementById("prev-btn"),
  nextBtn: document.getElementById("next-btn"),
  shuffleBtn: document.getElementById("shuffle-btn"),
  repeatBtn: document.getElementById("repeat-btn"),

  // Progress
  currTime: document.getElementById("curr-time"),
  totalDuration: document.getElementById("total-duration"),
  seekContainer: document.getElementById("seek-container"),
  seekFill: document.getElementById("seek-fill"),
  seekThumb: document.getElementById("seek-thumb"),

  // Volume
  volumeIcon: document.getElementById("volume-icon"),
  volumeContainer: document.getElementById("volume-container"),
  volumeFill: document.getElementById("volume-fill"),
  volumeThumb: document.getElementById("volume-thumb"),
  volumePercent: document.getElementById("volume-percent"),

  // Visualizer
  visualizer: document.getElementById("visualizer"),

  // Playlist
  playlistList: document.getElementById("playlist-list"),
  trackCount: document.getElementById("track-count"),

  // Songs Grid
  songsGrid: document.getElementById("songs-grid"),
  recentTracks: document.getElementById("recent-tracks"),

  // Featured
  featuredSection: document.getElementById("featured-section"),
  featuredTitle: document.getElementById("featured-title"),
  featuredDesc: document.getElementById("featured-desc"),
  featuredImg: document.getElementById("featured-img"),
  featuredPlay: document.getElementById("featured-play"),

  // Search
  searchInput: document.getElementById("search-input"),

  // Modal
  shortcutsModal: document.getElementById("shortcuts-modal"),
  modalClose: document.getElementById("modal-close"),

  // Toast
  toast: document.getElementById("toast"),
  toastMessage: document.getElementById("toast-message"),
  toastIcon: document.getElementById("toast-icon"),

  // View Buttons
  viewBtns: document.querySelectorAll(".view-btn"),

  // Tab Navigation
  menuTabs: document.querySelectorAll(".menu_top span"),

  // Sidebar Navigation
  navLinks: document.querySelectorAll(".nav-link"),

  // Favorites - Sidebar
  favoritesContainer: document.getElementById("favorites-container"),
  favoritesList: document.getElementById("favorites-list"),
  favoritesHeader: document.getElementById("favorites-header"),
  favoritesToggle: document.getElementById("favorites-toggle"),
  emptyFavorites: document.getElementById("empty-favorites"),
  favoritesCountBadge: document.getElementById("favorites-count-badge"),
  favoritesNavLink: document.getElementById("favorites-nav-link"),

  // Favorites - Main Content
  favoritesSection: document.getElementById("favorites-section"),
  favoritesGrid: document.getElementById("favorites-grid"),
  emptyFavoritesMain: document.getElementById("empty-favorites-main"),
  playAllFavorites: document.getElementById("play-all-favorites"),
  shuffleFavorites: document.getElementById("shuffle-favorites"),
  discoverSongsBtn: document.getElementById("discover-songs-btn"),

  // Discover Section
  discoverSection: document.getElementById("discover-section"),

  // Context Menu
  contextMenu: document.getElementById("context-menu"),
  ctxPlay: document.getElementById("ctx-play"),
  ctxAddFavorite: document.getElementById("ctx-add-favorite"),
  ctxRemoveFavorite: document.getElementById("ctx-remove-favorite"),
  ctxAddQueue: document.getElementById("ctx-add-queue"),
  ctxShare: document.getElementById("ctx-share"),
};

// STATE MANAGEMENT

const state = {
  currentTrackIndex: 0,
  isPlaying: false,
  isShuffle: false,
  repeatMode: "none", // none, one, all
  volume: 0.7,
  previousVolume: 0.7,
  isMuted: false,
  recentlyPlayed: [],
  searchQuery: "",
  isDraggingSeek: false,
  isDraggingVolume: false,
  currentSection: "discover", // discover, favorites, library
  favoritesExpanded: true,
  contextMenuTrackIndex: null,
  queue: [],
};

// INITIALIZATION

async function init() {
  console.log("🔄 Starting initialization...");

  try {
    // Load tracks from database FIRST and wait for it
    await loadTracks();
    console.log(" Database tracks loaded:", tracks.length);

    // Load user preferences from localStorage (not tracks)
    loadFromLocalStorage();

    // Load the current track if exists
    if (tracks.length > 0) {
      const validIndex = Math.min(state.currentTrackIndex, tracks.length - 1);
      state.currentTrackIndex = validIndex;
      loadTrack(validIndex, false);
    }

    // Setup event listeners
    setupEventListeners();
    updateVolumeUI();
    updateShuffleUI();
    updateRepeatUI();
    showSection(state.currentSection);

    console.log("🎵 VibeStream initialized successfully!");
    console.log("📊 Final track count:", tracks.length);
  } catch (error) {
    console.error("❌ Initialization failed:", error);
  }
}

// LOCAL STORAGE

function loadFromLocalStorage() {
  const savedState = localStorage.getItem("vibeStreamState");
  if (savedState) {
    const parsed = JSON.parse(savedState);
    state.volume = parsed.volume ?? 0.7;
    state.isShuffle = parsed.isShuffle ?? false;
    state.repeatMode = parsed.repeatMode ?? "none";
    state.recentlyPlayed = parsed.recentlyPlayed ?? [];
    state.currentTrackIndex = parsed.currentTrackIndex ?? 0;
    state.favoritesExpanded = parsed.favoritesExpanded ?? true;
    state.currentSection = parsed.currentSection ?? "discover";

    // Restore liked tracks
    if (parsed.likedTracks) {
      tracks.forEach((track) => {
        track.liked = parsed.likedTracks.includes(track.id);
      });
    }
  }
}

function saveToLocalStorage() {
  const dataToSave = {
    volume: state.volume,
    isShuffle: state.isShuffle,
    repeatMode: state.repeatMode,
    recentlyPlayed: state.recentlyPlayed.slice(0, 20),
    currentTrackIndex: state.currentTrackIndex,
    likedTracks: tracks.filter((t) => t.liked).map((t) => t.id),
    favoritesExpanded: state.favoritesExpanded,
    currentSection: state.currentSection,
  };
  localStorage.setItem("vibeStreamState", JSON.stringify(dataToSave));
}

// SECTION NAVIGATION

function showSection(section) {
  state.currentSection = section;

  // Update nav links
  elements.navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.section === section);
  });

  // Update menu tabs
  elements.menuTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === section);
  });

  // Show/hide sections
  if (elements.discoverSection) {
    elements.discoverSection.style.display =
      section === "discover" ? "block" : "none";
  }

  if (elements.favoritesSection) {
    elements.favoritesSection.style.display =
      section === "favorites" ? "block" : "none";
  }

  if (elements.featuredSection) {
    elements.featuredSection.style.display =
      section === "discover" ? "flex" : "none";
  }

  // Re-render favorites when showing favorites section
  if (section === "favorites") {
    renderFavoritesMain();
  }

  saveToLocalStorage();
}

// RENDERING - PLAYLIST

function renderPlaylist() {
  if (!elements.playlistList) return;

  elements.playlistList.innerHTML = "";

  tracks.forEach((track, index) => {
    const item = document.createElement("div");
    item.className = `playlist-item ${index === state.currentTrackIndex ? "active" : ""}`;
    item.dataset.index = index;

    item.innerHTML = `
      <img src="${track.cover}" alt="${track.title}" loading="lazy">
      <div class="playlist-item-info">
        <h5>${track.title}</h5>
        <p>${track.artist}</p>
      </div>
      <button class="playlist-favorite-btn ${track.liked ? "liked" : ""}" 
              data-index="${index}" 
              title="${track.liked ? "Remove from Favorites" : "Add to Favorites"}">
        ${track.liked ? "❤️" : "🤍"}
      </button>
      <div class="playing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span class="duration">${track.duration}</span>
    `;

    // Click to play
    item.addEventListener("click", (e) => {
      if (!e.target.classList.contains("playlist-favorite-btn")) {
        handleTrackClick(index);
      }
    });

    // Right-click context menu
    item.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      showContextMenu(e, index);
    });

    // Favorite button
    const favBtn = item.querySelector(".playlist-favorite-btn");
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTrackFavorite(index);
    });

    elements.playlistList.appendChild(item);
  });
}

// RENDERING - SONGS GRID

function renderSongsGrid() {
  if (!elements.songsGrid) return;

  elements.songsGrid.innerHTML = "";

  tracks.forEach((track, index) => {
    const card = createSongCard(track, index);
    elements.songsGrid.appendChild(card);
  });
}

function createSongCard(track, index) {
  const card = document.createElement("div");
  card.className = `song_card ${index === state.currentTrackIndex ? "active" : ""}`;
  card.dataset.index = index;

  card.innerHTML = `
    <div class="song_card-artwork">
      <img src="${track.cover}" alt="${track.title}" loading="lazy">
      <button class="song_card-favorite ${track.liked ? "liked" : ""}" 
              data-index="${index}"
              title="${track.liked ? "Remove from Favorites" : "Add to Favorites"}">
        ${track.liked ? "❤️" : "🤍"}
      </button>
      <button class="song_card-play" aria-label="Play ${track.title}">▶</button>
    </div>
    <div class="song_card-info">
      <h5>${track.title}</h5>
      <p>${track.artist}</p>
    </div>
  `;

  // Play button
  const playButton = card.querySelector(".song_card-play");
  playButton.addEventListener("click", (e) => {
    e.stopPropagation();
    handleTrackClick(index);
  });

  // Favorite button
  const favButton = card.querySelector(".song_card-favorite");
  favButton.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleTrackFavorite(index);
  });

  // Card click
  card.addEventListener("click", () => handleTrackClick(index));

  // Right-click context menu
  card.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showContextMenu(e, index);
  });

  return card;
}

// RENDERING - RECENT TRACKS

function renderRecentTracks() {
  if (!elements.recentTracks) return;

  elements.recentTracks.innerHTML = "";

  const recentToShow =
    state.recentlyPlayed.length > 0
      ? state.recentlyPlayed.slice(0, 8)
      : tracks.slice(0, 8).map((t) => t.id);

  recentToShow.forEach((trackId) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;

    const index = tracks.indexOf(track);
    const item = document.createElement("div");
    item.className = "recent-item";
    item.dataset.index = index;

    item.innerHTML = `
      <img src="${track.cover}" alt="${track.title}" loading="lazy">
      <div class="recent-item-info">
        <h6>${track.title}</h6>
        <p>${track.artist}</p>
      </div>
      <button class="recent-favorite-btn ${track.liked ? "liked" : ""}" data-index="${index}">
        ${track.liked ? "❤️" : "🤍"}
      </button>
    `;

    item.addEventListener("click", (e) => {
      if (!e.target.classList.contains("recent-favorite-btn")) {
        handleTrackClick(index);
      }
    });

    const favBtn = item.querySelector(".recent-favorite-btn");
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTrackFavorite(index);
    });

    item.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      showContextMenu(e, index);
    });

    elements.recentTracks.appendChild(item);
  });
}

// RENDERING - FAVORITES SIDEBAR

function renderFavoritesSidebar() {
  if (!elements.favoritesList) return;

  const favoriteTracks = tracks.filter((t) => t.liked);

  // Clear existing items (except empty state)
  const existingItems =
    elements.favoritesList.querySelectorAll(".favorite-item");
  existingItems.forEach((item) => item.remove());

  // Show/hide empty state
  if (elements.emptyFavorites) {
    elements.emptyFavorites.style.display =
      favoriteTracks.length === 0 ? "flex" : "none";
  }

  // Update toggle state
  if (elements.favoritesToggle) {
    elements.favoritesToggle.textContent = state.favoritesExpanded ? "▼" : "▶";
  }

  if (elements.favoritesList) {
    elements.favoritesList.style.display = state.favoritesExpanded
      ? "flex"
      : "none";
  }

  // Render favorite items
  favoriteTracks.forEach((track) => {
    const index = tracks.indexOf(track);
    const item = document.createElement("div");
    item.className = `favorite-item ${index === state.currentTrackIndex ? "active" : ""}`;
    item.dataset.index = index;
    item.dataset.id = track.id;

    item.innerHTML = `
      <img src="${track.cover}" alt="${track.title}" loading="lazy">
      <div class="favorite-item-info">
        <h5>${track.title}</h5>
        <p>${track.artist}</p>
      </div>
      <button class="remove-favorite-btn" data-index="${index}" title="Remove from Favorites">
        ✕
      </button>
    `;

    // Click to play
    item.addEventListener("click", (e) => {
      if (!e.target.classList.contains("remove-favorite-btn")) {
        handleTrackClick(index);
      }
    });

    // Remove button
    const removeBtn = item.querySelector(".remove-favorite-btn");
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTrackFavorite(index);
    });

    // Insert before empty state
    if (elements.emptyFavorites) {
      elements.favoritesList.insertBefore(item, elements.emptyFavorites);
    } else {
      elements.favoritesList.appendChild(item);
    }
  });

  updateFavoritesCount();
}

// RENDERING - FAVORITES MAIN SECTION

function renderFavoritesMain() {
  if (!elements.favoritesGrid) return;

  const favoriteTracks = tracks.filter((t) => t.liked);

  elements.favoritesGrid.innerHTML = "";

  // Show/hide empty state
  if (elements.emptyFavoritesMain) {
    elements.emptyFavoritesMain.style.display =
      favoriteTracks.length === 0 ? "flex" : "none";
  }

  if (elements.favoritesGrid) {
    elements.favoritesGrid.style.display =
      favoriteTracks.length > 0 ? "grid" : "none";
  }

  // Show/hide action buttons
  if (elements.playAllFavorites) {
    elements.playAllFavorites.style.display =
      favoriteTracks.length > 0 ? "inline-flex" : "none";
  }
  if (elements.shuffleFavorites) {
    elements.shuffleFavorites.style.display =
      favoriteTracks.length > 0 ? "inline-flex" : "none";
  }

  // Render favorite cards
  favoriteTracks.forEach((track) => {
    const index = tracks.indexOf(track);
    const card = document.createElement("div");
    card.className = `favorite-card ${index === state.currentTrackIndex ? "active" : ""}`;
    card.dataset.index = index;

    card.innerHTML = `
      <div class="favorite-card-artwork">
        <img src="${track.cover}" alt="${track.title}" loading="lazy">
        <div class="favorite-card-overlay">
          <button class="favorite-card-play" data-index="${index}">▶</button>
        </div>
        <button class="favorite-card-remove" data-index="${index}" title="Remove from Favorites">
          ✕
        </button>
      </div>
      <div class="favorite-card-info">
        <h5>${track.title}</h5>
        <p>${track.artist}</p>
        <span class="favorite-card-duration">${track.duration}</span>
      </div>
    `;

    // Play button
    const playBtn = card.querySelector(".favorite-card-play");
    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleTrackClick(index);
    });

    // Remove button
    const removeBtn = card.querySelector(".favorite-card-remove");
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTrackFavorite(index);
    });

    // Card click
    card.addEventListener("click", () => handleTrackClick(index));

    // Context menu
    card.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      showContextMenu(e, index);
    });

    elements.favoritesGrid.appendChild(card);
  });
}

// FAVORITES FUNCTIONS

function toggleTrackFavorite(index) {
  const track = tracks[index];
  track.liked = !track.liked;

  // Update all UIs
  updateAllFavoriteUIs();

  // Update player like button if current track
  if (index === state.currentTrackIndex) {
    updateLikeButton(track.liked);
  }

  // Show toast
  showToast(
    track.liked
      ? `❤️ "${track.title}" added to favorites`
      : `💔 "${track.title}" removed from favorites`,
    track.liked ? "success" : "info",
  );

  // Save state
  saveToLocalStorage();
}

function updateAllFavoriteUIs() {
  renderFavoritesSidebar();
  renderFavoritesMain();
  updateFavoritesCount();

  // Update playlist favorite buttons
  document.querySelectorAll(".playlist-favorite-btn").forEach((btn) => {
    const index = parseInt(btn.dataset.index);
    const track = tracks[index];
    btn.classList.toggle("liked", track.liked);
    btn.textContent = track.liked ? "❤️" : "🤍";
    btn.title = track.liked ? "Remove from Favorites" : "Add to Favorites";
  });

  // Update song card favorite buttons
  document.querySelectorAll(".song_card-favorite").forEach((btn) => {
    const index = parseInt(btn.dataset.index);
    const track = tracks[index];
    btn.classList.toggle("liked", track.liked);
    btn.textContent = track.liked ? "❤️" : "🤍";
    btn.title = track.liked ? "Remove from Favorites" : "Add to Favorites";
  });

  // Update recent favorite buttons
  document.querySelectorAll(".recent-favorite-btn").forEach((btn) => {
    const index = parseInt(btn.dataset.index);
    const track = tracks[index];
    btn.classList.toggle("liked", track.liked);
    btn.textContent = track.liked ? "❤️" : "🤍";
  });
}

function updateFavoritesCount() {
  const count = tracks.filter((t) => t.liked).length;

  if (elements.favoritesCountBadge) {
    elements.favoritesCountBadge.textContent = count;
    elements.favoritesCountBadge.style.display = count > 0 ? "inline" : "none";
  }
}

function toggleFavoritesExpanded() {
  state.favoritesExpanded = !state.favoritesExpanded;

  if (elements.favoritesToggle) {
    elements.favoritesToggle.textContent = state.favoritesExpanded ? "▼" : "▶";
  }

  if (elements.favoritesList) {
    elements.favoritesList.style.display = state.favoritesExpanded
      ? "flex"
      : "none";
  }

  saveToLocalStorage();
}

function playAllFavorites() {
  const favoriteTracks = tracks.filter((t) => t.liked);
  if (favoriteTracks.length === 0) {
    showToast("💔 No favorites to play", "warning");
    return;
  }

  // Play first favorite
  const firstFavorite = favoriteTracks[0];
  const index = tracks.indexOf(firstFavorite);
  state.currentTrackIndex = index;
  loadTrack(index);

  showToast(`▶ Playing ${favoriteTracks.length} favorite songs`, "success");
}

function shufflePlayFavorites() {
  const favoriteTracks = tracks.filter((t) => t.liked);
  if (favoriteTracks.length === 0) {
    showToast("💔 No favorites to shuffle", "warning");
    return;
  }

  // Enable shuffle mode
  state.isShuffle = true;
  updateShuffleUI();

  // Pick random favorite
  const randomFavorite =
    favoriteTracks[Math.floor(Math.random() * favoriteTracks.length)];
  const index = tracks.indexOf(randomFavorite);
  state.currentTrackIndex = index;
  loadTrack(index);

  showToast(`🔀 Shuffling ${favoriteTracks.length} favorite songs`, "success");
}

// CONTEXT MENU

function showContextMenu(e, trackIndex) {
  if (!elements.contextMenu) return;

  state.contextMenuTrackIndex = trackIndex;
  const track = tracks[trackIndex];

  // Show/hide appropriate menu items
  if (elements.ctxAddFavorite) {
    elements.ctxAddFavorite.style.display = track.liked ? "none" : "flex";
  }
  if (elements.ctxRemoveFavorite) {
    elements.ctxRemoveFavorite.style.display = track.liked ? "flex" : "none";
  }

  // Position menu
  let x = e.clientX;
  let y = e.clientY;

  elements.contextMenu.style.left = `${x}px`;
  elements.contextMenu.style.top = `${y}px`;
  elements.contextMenu.classList.add("show");

  // Adjust if menu goes off screen
  requestAnimationFrame(() => {
    const rect = elements.contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      elements.contextMenu.style.left = `${x - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
      elements.contextMenu.style.top = `${y - rect.height}px`;
    }
  });
}

function hideContextMenu() {
  if (elements.contextMenu) {
    elements.contextMenu.classList.remove("show");
  }
  state.contextMenuTrackIndex = null;
}

function handleContextMenuAction(action) {
  const index = state.contextMenuTrackIndex;
  if (index === null) return;

  const track = tracks[index];

  switch (action) {
    case "play":
      state.currentTrackIndex = index;
      loadTrack(index);
      break;

    case "add-favorite":
    case "remove-favorite":
      toggleTrackFavorite(index);
      break;

    case "add-queue":
      state.queue.push(track.id);
      showToast(`📋 "${track.title}" added to queue`, "success");
      break;

    case "share":
      if (navigator.share) {
        navigator
          .share({
            title: track.title,
            text: `Listen to ${track.title} by ${track.artist}`,
            url: window.location.href,
          })
          .catch(() => {});
      } else {
        navigator.clipboard.writeText(`${track.title} - ${track.artist}`);
        showToast("📋 Track info copied to clipboard", "success");
      }
      break;
  }

  hideContextMenu();
}

// UPDATE FUNCTIONS

function updateTrackCount() {
  if (elements.trackCount) {
    elements.trackCount.textContent = `${tracks.length} tracks`;
  }
}

function updatePlaylistUI() {
  // Update playlist items
  const items = elements.playlistList?.querySelectorAll(".playlist-item");
  items?.forEach((item, index) => {
    item.classList.toggle("active", index === state.currentTrackIndex);
  });

  // Update song cards
  const cards = elements.songsGrid?.querySelectorAll(".song_card");
  cards?.forEach((card, index) => {
    card.classList.toggle("active", index === state.currentTrackIndex);
  });

  // Update favorite items in sidebar
  const favItems = elements.favoritesList?.querySelectorAll(".favorite-item");
  favItems?.forEach((item) => {
    const index = parseInt(item.dataset.index);
    item.classList.toggle("active", index === state.currentTrackIndex);
  });

  // Update favorite cards in main section
  const favCards = elements.favoritesGrid?.querySelectorAll(".favorite-card");
  favCards?.forEach((card) => {
    const index = parseInt(card.dataset.index);
    card.classList.toggle("active", index === state.currentTrackIndex);
  });
}

// TRACK LOADING

function loadTrack(index, autoPlay = true) {
  const track = tracks[index];

  // Validate track and audio source
  if (!track) {
    console.error("Invalid track index:", index);
    showToast("Track not found", "error");
    return;
  }

  if (!track.src || track.src.trim() === "") {
    console.error("No audio source for track:", track.title);
    showToast("No audio source available", "error");
    return;
  }

  // Log the audio URL being loaded (for debugging)
  console.log("🎵 Loading track:", track.title);
  console.log("📍 Audio URL:", track.src);

  // Set audio source
  if (elements.audio) {
    // Clear previous source first
    elements.audio.src = "";
    elements.audio.load();

    // Set new source
    elements.audio.src = track.src;

    // Add error handler for audio loading
    elements.audio.onerror = function (e) {
      console.error("❌ Audio load error:", e);
      console.error("Failed URL:", track.src);
      showToast(`Cannot load audio: ${track.title}`, "error");

      // Show helpful message in console
      console.log("💡 Troubleshooting:");
      console.log(
        "1. Check if the URL is a direct link to an audio file (ends with .mp3, .wav, etc.)",
      );
      console.log("2. Try opening the URL directly in your browser");
      console.log("3. Check if the file exists and is accessible");
      console.log("4. Verify CORS headers if loading from external domain");
    };

    // Add success handler
    elements.audio.onloadedmetadata = function () {
      console.log("✅ Audio loaded successfully");
      console.log("Duration:", elements.audio.duration);

      // Update duration if not set
      if (
        !track.duration ||
        track.duration === "0:00" ||
        track.duration === "Unknown"
      ) {
        const minutes = Math.floor(elements.audio.duration / 60);
        const seconds = Math.floor(elements.audio.duration % 60);
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        if (elements.totalDuration) {
          elements.totalDuration.textContent = formattedDuration;
        }
      }
    };
  }

  if (elements.playerImg) elements.playerImg.src = track.cover;
  if (elements.playerTrackName)
    elements.playerTrackName.textContent = track.title;
  if (elements.playerArtistName)
    elements.playerArtistName.textContent = track.artist;

  // Update featured section
  if (elements.featuredTitle) {
    elements.featuredTitle.textContent = `${track.artist} – ${track.title}`;
  }
  if (elements.featuredImg) {
    elements.featuredImg.src = track.cover;
  }

  // Update like button
  updateLikeButton(track.liked);

  // Reset progress
  if (elements.seekFill) elements.seekFill.style.width = "0%";
  if (elements.currTime) elements.currTime.textContent = "0:00";
  if (elements.totalDuration)
    elements.totalDuration.textContent = track.duration || "0:00";

  // Update UI
  updatePlaylistUI();

  // Add to recently played
  addToRecentlyPlayed(track.id);

  // Update Media Session
  updateMediaSession(track);

  // Auto play if needed
  if (autoPlay) {
    playTrack();
  }

  // Save state
  saveToLocalStorage();
}

function updateMediaSession(track) {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: [{ src: track.cover, sizes: "512x512", type: "image/jpeg" }],
    });
  }
}

function handleTrackClick(index) {
  if (index === state.currentTrackIndex && state.isPlaying) {
    pauseTrack();
  } else if (index === state.currentTrackIndex) {
    playTrack();
  } else {
    state.currentTrackIndex = index;
    loadTrack(index);
  }
}

// PLAYBACK CONTROLS

function playTrack() {
  // Check if audio source is set
  if (!elements.audio.src || elements.audio.src === "") {
    console.error("No audio source to play");
    showToast("No audio source available", "error");
    return;
  }

  elements.audio
    .play()
    .then(() => {
      state.isPlaying = true;
      if (elements.playBtn) elements.playBtn.textContent = "⏸";
      if (elements.playerContainer)
        elements.playerContainer.classList.add("playing");
      document.title = `${tracks[state.currentTrackIndex].title} | VibeStream`;
    })
    .catch((error) => {
      console.error("❌ Playback failed:", error);
      console.error("Track:", tracks[state.currentTrackIndex]);
      console.error("Audio URL:", tracks[state.currentTrackIndex].src);

      // Provide specific error messages
      if (error.name === "NotSupportedError") {
        showToast("Audio format not supported or file not found", "error");
        console.log("💡 The URL might not be a valid audio file.");
        console.log(
          "💡 Try a different URL or check if the file is accessible.",
        );
      } else if (error.name === "NotAllowedError") {
        showToast("Playback blocked by browser", "error");
        console.log("💡 Try clicking play again (browser autoplay policy).");
      } else {
        showToast("Unable to play track", "error");
      }
    });
}

function pauseTrack() {
  elements.audio.pause();
  state.isPlaying = false;
  if (elements.playBtn) elements.playBtn.textContent = "▶";
  if (elements.playerContainer)
    elements.playerContainer.classList.remove("playing");
  document.title = "VibeStream | Premium Music Experience";
}

function togglePlay() {
  if (state.isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
}

function nextTrack() {
  let nextIndex;

  // Check queue first
  if (state.queue.length > 0) {
    const nextTrackId = state.queue.shift();
    const track = tracks.find((t) => t.id === nextTrackId);
    if (track) {
      nextIndex = tracks.indexOf(track);
    }
  } else if (state.isShuffle) {
    nextIndex = getRandomTrackIndex();
  } else {
    nextIndex = (state.currentTrackIndex + 1) % tracks.length;
  }

  state.currentTrackIndex = nextIndex;
  loadTrack(nextIndex);
}

function prevTrack() {
  // If more than 3 seconds into track, restart it
  if (elements.audio.currentTime > 3) {
    elements.audio.currentTime = 0;
    return;
  }

  let prevIndex;

  if (state.isShuffle) {
    prevIndex = getRandomTrackIndex();
  } else {
    prevIndex = (state.currentTrackIndex - 1 + tracks.length) % tracks.length;
  }

  state.currentTrackIndex = prevIndex;
  loadTrack(prevIndex);
}

function getRandomTrackIndex() {
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * tracks.length);
  } while (randomIndex === state.currentTrackIndex && tracks.length > 1);
  return randomIndex;
}

function handleTrackEnd() {
  switch (state.repeatMode) {
    case "one":
      elements.audio.currentTime = 0;
      playTrack();
      break;
    case "all":
      nextTrack();
      break;
    case "none":
    default:
      if (
        state.currentTrackIndex < tracks.length - 1 ||
        state.queue.length > 0
      ) {
        nextTrack();
      } else {
        pauseTrack();
        if (elements.seekFill) elements.seekFill.style.width = "0%";
        if (elements.currTime) elements.currTime.textContent = "0:00";
      }
      break;
  }
}

// SHUFFLE & REPEAT

function toggleShuffle() {
  state.isShuffle = !state.isShuffle;
  updateShuffleUI();
  showToast(
    state.isShuffle ? "🔀 Shuffle enabled" : "🔀 Shuffle disabled",
    "info",
  );
  saveToLocalStorage();
}

function updateShuffleUI() {
  if (elements.shuffleBtn) {
    elements.shuffleBtn.classList.toggle("active", state.isShuffle);
  }
}

function toggleRepeat() {
  const modes = ["none", "all", "one"];
  const currentIndex = modes.indexOf(state.repeatMode);
  state.repeatMode = modes[(currentIndex + 1) % modes.length];
  updateRepeatUI();

  const messages = {
    none: "🔁 Repeat off",
    all: "🔁 Repeat all",
    one: "🔂 Repeat one",
  };
  showToast(messages[state.repeatMode], "info");
  saveToLocalStorage();
}

function updateRepeatUI() {
  if (elements.repeatBtn) {
    elements.repeatBtn.classList.toggle("active", state.repeatMode !== "none");
    elements.repeatBtn.textContent = state.repeatMode === "one" ? "🔂" : "🔁";
  }
}

// PROGRESS & SEEKING

function updateProgress() {
  if (state.isDraggingSeek) return;

  const { currentTime, duration } = elements.audio;

  if (duration) {
    const progressPercent = (currentTime / duration) * 100;
    if (elements.seekFill)
      elements.seekFill.style.width = `${progressPercent}%`;
    if (elements.currTime)
      elements.currTime.textContent = formatTime(currentTime);
  }
}

function setProgress(e) {
  const rect = elements.seekContainer.getBoundingClientRect();
  const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const percent = clickX / rect.width;

  if (elements.audio.duration) {
    elements.audio.currentTime = percent * elements.audio.duration;
    if (elements.seekFill) elements.seekFill.style.width = `${percent * 100}%`;
  }
}

function setDuration() {
  if (elements.audio.duration && elements.totalDuration) {
    elements.totalDuration.textContent = formatTime(elements.audio.duration);
  }
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// VOLUME CONTROL

function setVolume(e) {
  const rect = elements.volumeContainer.getBoundingClientRect();
  const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const percent = clickX / rect.width;

  state.volume = percent;
  state.isMuted = false;
  elements.audio.volume = state.volume;
  updateVolumeUI();
  saveToLocalStorage();
}

function updateVolumeUI() {
  const volumePercent = state.isMuted ? 0 : state.volume * 100;

  if (elements.volumeFill) {
    elements.volumeFill.style.width = `${volumePercent}%`;
  }

  if (elements.volumePercent) {
    elements.volumePercent.textContent = `${Math.round(volumePercent)}%`;
  }

  if (elements.volumeIcon) {
    if (state.isMuted || state.volume === 0) {
      elements.volumeIcon.textContent = "🔇";
    } else if (state.volume < 0.3) {
      elements.volumeIcon.textContent = "🔈";
    } else if (state.volume < 0.7) {
      elements.volumeIcon.textContent = "🔉";
    } else {
      elements.volumeIcon.textContent = "🔊";
    }
  }
}

function toggleMute() {
  if (state.isMuted) {
    state.isMuted = false;
    elements.audio.volume = state.volume;
  } else {
    state.previousVolume = state.volume;
    state.isMuted = true;
    elements.audio.volume = 0;
  }
  updateVolumeUI();
}

function adjustVolume(delta) {
  state.volume = Math.max(0, Math.min(1, state.volume + delta));
  state.isMuted = false;
  elements.audio.volume = state.volume;
  updateVolumeUI();
  saveToLocalStorage();
}

// LIKE FUNCTIONALITY (Current Track)

function toggleLike() {
  toggleTrackFavorite(state.currentTrackIndex);
}

function updateLikeButton(isLiked) {
  if (elements.likeBtn) {
    elements.likeBtn.textContent = isLiked ? "❤️" : "🤍";
    elements.likeBtn.classList.toggle("liked", isLiked);
    elements.likeBtn.title = isLiked
      ? "Remove from Favorites (L)"
      : "Add to Favorites (L)";
  }
}

// RECENTLY PLAYED

function addToRecentlyPlayed(trackId) {
  state.recentlyPlayed = state.recentlyPlayed.filter((id) => id !== trackId);
  state.recentlyPlayed.unshift(trackId);
  state.recentlyPlayed = state.recentlyPlayed.slice(0, 20);
  renderRecentTracks();
  saveToLocalStorage();
}

// SEARCH

function handleSearch(query) {
  state.searchQuery = query.toLowerCase().trim();

  const cards = elements.songsGrid?.querySelectorAll(".song_card");
  const playlistItems =
    elements.playlistList?.querySelectorAll(".playlist-item");

  tracks.forEach((track, index) => {
    const matches =
      state.searchQuery === "" ||
      track.title.toLowerCase().includes(state.searchQuery) ||
      track.artist.toLowerCase().includes(state.searchQuery) ||
      track.album?.toLowerCase().includes(state.searchQuery);

    if (cards && cards[index]) {
      cards[index].style.display = matches ? "" : "none";
    }
    if (playlistItems && playlistItems[index]) {
      playlistItems[index].style.display = matches ? "" : "none";
    }
  });
}

// TOAST NOTIFICATIONS

function showToast(message, type = "success", duration = 3000) {
  if (!elements.toast || !elements.toastMessage) return;

  // Set icon based on type
  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  if (elements.toastIcon) {
    elements.toastIcon.textContent = icons[type] || "✓";
  }

  elements.toastMessage.textContent = message;
  elements.toast.className = `toast ${type}`;
  elements.toast.classList.add("show");

  setTimeout(() => {
    elements.toast.classList.remove("show");
  }, duration);
}

// MODAL

function showShortcutsModal() {
  if (elements.shortcutsModal) {
    elements.shortcutsModal.classList.add("show");
  }
}

function hideShortcutsModal() {
  if (elements.shortcutsModal) {
    elements.shortcutsModal.classList.remove("show");
  }
}

// KEYBOARD SHORTCUTS

function handleKeyboard(e) {
  // Ignore if typing in input
  if (e.target.tagName === "INPUT") {
    if (e.key === "Escape") {
      e.target.blur();
    }
    return;
  }

  switch (e.code) {
    case "Space":
      e.preventDefault();
      togglePlay();
      break;

    case "KeyN":
      nextTrack();
      showToast("⏭ Next track", "info");
      break;

    case "KeyP":
      prevTrack();
      showToast("⏮ Previous track", "info");
      break;

    case "KeyS":
      toggleShuffle();
      break;

    case "KeyR":
      toggleRepeat();
      break;

    case "KeyM":
      toggleMute();
      showToast(state.isMuted ? "🔇 Muted" : "🔊 Unmuted", "info");
      break;

    case "KeyL":
      toggleLike();
      break;

    case "KeyF":
      showSection("favorites");
      showToast("❤️ Showing favorites", "info");
      break;

    case "KeyD":
      showSection("discover");
      showToast("🏠 Showing discover", "info");
      break;

    case "ArrowRight":
      if (elements.audio.duration) {
        elements.audio.currentTime = Math.min(
          elements.audio.duration,
          elements.audio.currentTime + 10,
        );
        showToast("⏩ +10 seconds", "info");
      }
      break;

    case "ArrowLeft":
      elements.audio.currentTime = Math.max(0, elements.audio.currentTime - 10);
      showToast("⏪ -10 seconds", "info");
      break;

    case "ArrowUp":
      e.preventDefault();
      adjustVolume(0.1);
      showToast(`🔊 Volume: ${Math.round(state.volume * 100)}%`, "info");
      break;

    case "ArrowDown":
      e.preventDefault();
      adjustVolume(-0.1);
      showToast(`🔊 Volume: ${Math.round(state.volume * 100)}%`, "info");
      break;

    case "Slash":
      if (e.shiftKey) {
        e.preventDefault();
        showShortcutsModal();
      }
      break;

    case "Escape":
      hideShortcutsModal();
      hideContextMenu();
      break;

    case "KeyK":
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        elements.searchInput?.focus();
      }
      break;
  }
}

// DRAG HANDLING

function handleSeekDrag(e) {
  if (!state.isDraggingSeek) return;
  setProgress(e);
}

function handleVolumeDrag(e) {
  if (!state.isDraggingVolume) return;
  setVolume(e);
}

// EVENT LISTENERS

function setupEventListeners() {
  // Playback controls
  elements.playBtn?.addEventListener("click", togglePlay);
  elements.nextBtn?.addEventListener("click", nextTrack);
  elements.prevBtn?.addEventListener("click", prevTrack);
  elements.shuffleBtn?.addEventListener("click", toggleShuffle);
  elements.repeatBtn?.addEventListener("click", toggleRepeat);
  elements.likeBtn?.addEventListener("click", toggleLike);

  // Featured play button
  elements.featuredPlay?.addEventListener("click", () => {
    if (state.isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  });

  // Audio events
  elements.audio?.addEventListener("timeupdate", updateProgress);
  elements.audio?.addEventListener("loadedmetadata", setDuration);
  elements.audio?.addEventListener("ended", handleTrackEnd);
  elements.audio?.addEventListener("error", () => {
    showToast("Error loading track", "error");
    console.error("Audio error:", elements.audio.error);
  });

  // Progress bar
  elements.seekContainer?.addEventListener("click", setProgress);
  elements.seekContainer?.addEventListener("mousedown", (e) => {
    state.isDraggingSeek = true;
    setProgress(e);
  });

  // Volume control
  elements.volumeContainer?.addEventListener("click", setVolume);
  elements.volumeIcon?.addEventListener("click", toggleMute);
  elements.volumeContainer?.addEventListener("mousedown", (e) => {
    state.isDraggingVolume = true;
    setVolume(e);
  });

  // Global drag handling
  document.addEventListener("mousemove", (e) => {
    handleSeekDrag(e);
    handleVolumeDrag(e);
  });

  document.addEventListener("mouseup", () => {
    state.isDraggingSeek = false;
    state.isDraggingVolume = false;
  });

  // Search
  elements.searchInput?.addEventListener("input", (e) => {
    handleSearch(e.target.value);
  });

  // Keyboard
  document.addEventListener("keydown", handleKeyboard);

  // Modal
  elements.modalClose?.addEventListener("click", hideShortcutsModal);
  elements.shortcutsModal?.addEventListener("click", (e) => {
    if (e.target === elements.shortcutsModal) {
      hideShortcutsModal();
    }
  });

  // Context Menu
  elements.ctxPlay?.addEventListener("click", () =>
    handleContextMenuAction("play"),
  );
  elements.ctxAddFavorite?.addEventListener("click", () =>
    handleContextMenuAction("add-favorite"),
  );
  elements.ctxRemoveFavorite?.addEventListener("click", () =>
    handleContextMenuAction("remove-favorite"),
  );
  elements.ctxAddQueue?.addEventListener("click", () =>
    handleContextMenuAction("add-queue"),
  );
  elements.ctxShare?.addEventListener("click", () =>
    handleContextMenuAction("share"),
  );

  // Hide context menu on click outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#context-menu")) {
      hideContextMenu();
    }
  });

  document.addEventListener("scroll", hideContextMenu, true);

  // Navigation links
  elements.navLinks?.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      if (section) {
        showSection(section);
      }
    });
  });

  // Menu tabs
  elements.menuTabs?.forEach((tab) => {
    tab.addEventListener("click", () => {
      const section = tab.dataset.tab;
      if (section) {
        showSection(section);
      }
    });
  });

  // Favorites header toggle
  elements.favoritesHeader?.addEventListener("click", toggleFavoritesExpanded);

  // Favorites actions
  elements.playAllFavorites?.addEventListener("click", playAllFavorites);
  elements.shuffleFavorites?.addEventListener("click", shufflePlayFavorites);
  elements.discoverSongsBtn?.addEventListener("click", () => {
    showSection("discover");
  });

  // View toggle buttons
  elements.viewBtns?.forEach((btn) => {
    btn.addEventListener("click", () => {
      elements.viewBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      // Could implement list/grid view toggle here
    });
  });

  // Prevent context menu on player
  elements.playerContainer?.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  // Save state before leaving
  window.addEventListener("beforeunload", saveToLocalStorage);

  // Media Session API
  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", playTrack);
    navigator.mediaSession.setActionHandler("pause", pauseTrack);
    navigator.mediaSession.setActionHandler("previoustrack", prevTrack);
    navigator.mediaSession.setActionHandler("nexttrack", nextTrack);
  }
}

// START APPLICATION

document.addEventListener("DOMContentLoaded", init);

// ======================================================
// ⚠️ IMPORTANT: REPLACE THESE FUNCTIONS IN YOUR script.js
// ======================================================

// ============================================
// ADMIN PANEL LOGIC (Manage Backend)
// ============================================
const adminElements = {
  manageBtn: document.getElementById("manage-btn"),
  adminModal: document.getElementById("admin-modal"),
  adminClose: document.getElementById("admin-close"),
  addSongForm: document.getElementById("add-song-form"),
  adminSongList: document.getElementById("admin-song-list"),
};

// Event Listeners for Opening/Closing Modal
if (adminElements.manageBtn) {
  adminElements.manageBtn.addEventListener("click", () => {
    adminElements.adminModal.classList.add("show");
    renderAdminSongList();
  });
}

if (adminElements.adminClose) {
  adminElements.adminClose.addEventListener("click", () => {
    adminElements.adminModal.classList.remove("show");
  });
}

if (adminElements.addSongForm) {
  adminElements.addSongForm.addEventListener("submit", addSong);
}

// Render the List of Songs in Admin Panel
function renderAdminSongList() {
  if (!adminElements.adminSongList) return;
  adminElements.adminSongList.innerHTML = "";

  if (!Array.isArray(tracks) || tracks.length === 0) {
    adminElements.adminSongList.innerHTML =
      '<p style="color: #666; text-align: center; padding: 20px;">No songs in database</p>';
    return;
  }

  tracks.forEach((track) => {
    const item = document.createElement("div");
    item.className = "song-item-admin";
    item.innerHTML = `
      <div class="song-item-details">
        <img src="${track.cover}" alt="cover" onerror="this.src='https://via.placeholder.com/40'">
        <div>
          <h5 style="font-size:0.9rem; font-weight:600; color: white;">${track.title}</h5>
          <p style="font-size:0.8rem; color: #a1a1aa;">${track.artist}</p>
        </div>
      </div>
      <button class="delete-btn" onclick="deleteSong(${track.id})">Delete</button>
    `;
    adminElements.adminSongList.appendChild(item);
  });
}

// 1. UPDATED LOAD TRACKS (Fetches from PHP Database)
async function loadTracks() {
  console.log("📡 Fetching tracks from database...");

  try {
    // Fetch from the PHP file we created
    const response = await fetch("get_songs.php");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const dbTracks = await response.json();
    console.log("📥 Received from database:", dbTracks.length, "tracks");

    // Merge with LocalStorage to keep your "Likes" (since DB doesn't store user likes usually)
    const storedState =
      JSON.parse(localStorage.getItem("vibeStreamState")) || {};
    const likedIds = storedState.likedTracks || [];

    // Map DB data to our App format
    tracks = dbTracks.map((t) => ({
      ...t,
      id: parseInt(t.id), // Ensure ID is a number
      liked: likedIds.includes(parseInt(t.id)), // Restore like status
    }));

    console.log("✅ Tracks array updated:", tracks.length, "songs");
    console.log(
      "🆔 Track IDs:",
      tracks.map((t) => t.id),
    );

    // Update the UI with the new data
    renderPlaylist();
    renderSongsGrid();
    renderFavoritesSidebar();
    renderFavoritesMain();
    renderAdminSongList(); // Update the Admin list too
    updateTrackCount();

    console.log("🎨 UI rendered with database tracks");
    console.log("✅ Tracks loaded from Database:", tracks.length);
  } catch (error) {
    console.error("❌ Error loading tracks from Database:", error);
    console.error("❌ Error details:", error.message);
    showToast("Failed to connect to Database", "error");
  }
}

// 2. UPDATED ADD SONG (Sends data to add_song.php)

async function addSong(e) {
  e.preventDefault();
  const title = document.getElementById("new-title").value.trim();
  const artist =
    document.getElementById("new-artist").value.trim() || "Unknown";
  const url = document.getElementById("new-url").value.trim();
  cover =
    document.getElementById("new-cover").value.trim() || "images/default.jpg";
  if (!title || !url) {
    showToast("Title and Audio URL are required", "error");
    return;
  }
  const payload = {
    title,
    artist,
    src: url,
    cover,
    album: "Single",
    duration: "0:00",
  };
  try {
    const response = await fetch("add_song.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (response.ok) {
      showToast(`✅ Added "${title}" to library!`);
      document.getElementById("add-song-form").reset();
      await loadTracks();
    } else {
      showToast("❌ Error: " + (result.message || "Unknown error"), "error");
    }
  } catch (error) {
    console.error("Error adding song:", error);
    showToast("❌ Connection failed", "error");
  }
}

// 3. UPDATED DELETE SONG (Sends ID to delete_song.php)
// Make sure this is attached to window so HTML onclick works

window.deleteSong = async function (id) {
  if (!confirm("Are you sure you want to delete this song?")) return;
  try {
    const response = await fetch("delete_song.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id }),
    });
    const result = await response.json();
    if (response.ok) {
      showToast("🗑️ Song deleted");
      await loadTracks();
      if (tracks.length === 0) {
        pauseTrack();
        elements.audio.src = "";
      }
    } else {
      showToast("❌ Error: " + (result.message || "Unknown error"), "error");
    }
  } catch (error) {
    console.error("Error deleting song:", error);
    showToast("❌ Connection failed", "error");
  }
};
