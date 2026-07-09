console.log("Spotify Player Started...");

// ===============================
// Variables
// ===============================
let songs = [];
let audio = new Audio();
let currentIndex = 0;

const playBtn = document.getElementById("playPause");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("previous");
const songName = document.getElementById("songName");
const artistName = document.getElementById("artistName");
const songTime = document.getElementById("songTime");
const playbar = document.querySelector(".playbar");
const container = document.querySelector(".cardContainer");

// ===============================
// Load Songs (With Secure Fallback)
// ===============================
async function getSongs() {
    try {
        // VS Code Live Server ke liye automatic fetch trial
        let response = await fetch("./songs/");
        if (!response.ok) throw new Error("Directory listing not supported");
        
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let links = div.getElementsByTagName("a");

        songs = [];
        for (let i = 0; i < links.length; i++) {
            if (links[i].href.endsWith(".mp3")) {
                songs.push(links[i].href);
            }
        }
        
        if (songs.length === 0) throw new Error("No mp3 found via fetch");
        
        return songs;
    } catch (error) {
        console.warn("Using fallback array for GitHub Pages / Local Server.");
        
        // ✅ UPDATE: Aapki image ke mutabik exact song names yahan set kar diye hain.
        // GitHub Pages par yahi array kaam karega. Ensure karein ki folder ka naam 'songs' hi ho.
     songs = [
    "song (1).mp3",
    "song (2).mp3",
    "song (3).mp3",
    "song (4).mp3",
    "song (5).mp3",
    "song (6).mp3",
    "song (7).mp3",
    "song (8).mp3",
    "song (9).mp3",
    "song (10).mp3",
    "song (11).mp3",
    "song (12).mp3",
    "song (13).mp3"
];
        
        return songs;
    }
}

// ===============================
// Format Time
// ===============================
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

// ===============================
// Play Song
// ===============================
function playSong(index) {
    if (index < 0 || index >= songs.length) return;

    currentIndex = parseInt(index);
    audio.src = songs[currentIndex];
    
    audio.play().catch(err => console.log("Playback interaction error:", err));

    const cards = document.querySelectorAll(".song-card");
    if (cards[currentIndex]) {
        songName.innerText = cards[currentIndex].querySelector("h4").innerText;
        artistName.innerText = cards[currentIndex].querySelector("p").innerText;
    }

    resetCardIcons();

    if (cards[currentIndex]) {
        const cardPlayBtn = cards[currentIndex].querySelector(".play-icon");
        if (cardPlayBtn) {
            cardPlayBtn.classList.add("playing");
            cardPlayBtn.innerHTML = "❚❚";
        }
    }

    playBtn.innerHTML = "⏸";
}

// Reset Card Icons Utility
function resetCardIcons() {
    document.querySelectorAll(".play-icon").forEach(btn => {
        btn.classList.remove("playing");
        btn.innerHTML = "▶";
    });
}

// ===============================
// Main Function
// ===============================
async function main() {
    await getSongs();

    if (songs.length === 0) {
        console.error("No songs array configured.");
        return;
    }

    // 1. DOM dynamic render
    container.innerHTML = ""; 
    songs.forEach((song, index) => {
        // ✅ URL se %20 (spaces) aur %28 / %29 (brackets) hatane ke liye decodeURIComponent use kiya hai
        let fileName = decodeURIComponent(song.split("/").pop()).replace(".mp3", "");
        
        container.innerHTML += `
            <div class="song-card" data-index="${index}">
                <img src="cover.jpg" alt="cover">
                <h4>${fileName}</h4>
                <p>Unknown Artist</p>
                <div class="play-icon">▶</div>
            </div>
        `;
    });

    // 2. Click Listener setup
    const cards = document.querySelectorAll(".song-card");
    cards.forEach((card) => {
        card.addEventListener("click", () => {
            const index = card.getAttribute("data-index");
            playSong(index);
        });
    });
}

// Run Main
main();

// ===============================
// Event Listeners (Controls)
// ===============================
playBtn.addEventListener("click", () => {
    if (!audio.src) return;
    if (audio.paused) {
        audio.play().catch(err => console.log(err));
    } else {
        audio.pause();
    }
});

nextBtn.addEventListener("click", () => {
    if (songs.length === 0) return;
    currentIndex++;
    if (currentIndex >= songs.length) currentIndex = 0;
    playSong(currentIndex);
});

prevBtn.addEventListener("click", () => {
    if (songs.length === 0) return;
    currentIndex--;
    if (currentIndex < 0) currentIndex = songs.length - 1;
    playSong(currentIndex);
});

// ===============================
// Audio Status
// ===============================
audio.addEventListener("timeupdate", () => {
    songTime.innerHTML = formatTime(audio.currentTime) + " / " + formatTime(audio.duration);
});

audio.addEventListener("play", () => {
    playBtn.innerHTML = "⏸";
    if (playbar) playbar.classList.add("playing");
    
    const cards = document.querySelectorAll(".song-card");
    if (cards[currentIndex]) {
        const cardPlayBtn = cards[currentIndex].querySelector(".play-icon");
        if (cardPlayBtn) {
            cardPlayBtn.classList.add("playing");
            cardPlayBtn.innerHTML = "❚❚";
        }
    }
});

audio.addEventListener("pause", () => {
    playBtn.innerHTML = "▶";
    if (playbar) playbar.classList.remove("playing");
    resetCardIcons();
});

audio.addEventListener("ended", () => {
    if (playbar) playbar.classList.remove("playing");
    resetCardIcons();
    
    currentIndex++;
    if (currentIndex >= songs.length) currentIndex = 0;
    playSong(currentIndex);
});
