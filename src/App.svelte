<script lang="ts">
  import { onMount } from "svelte";
  import { settings } from "./stores/settings";
  import MainMenu from "./lib/MainMenu.svelte";
  import HowTo from "./lib/HowTo.svelte";
  import MapSelect from "./lib/MapSelect.svelte";
  import CategorySelect from "./lib/CategorySelect.svelte";
  import Game from "./lib/Game.svelte";
  import FinalScore from "./lib/FinalScore.svelte";
  import Settings from "./lib/Settings.svelte";
  import Credits from "./lib/Credits.svelte";
  import PlayerName from "./lib/PlayerName.svelte";
  import HighScores from "./lib/HighScores.svelte";
  import PauseMenu from "./lib/PauseMenu.svelte";

  // Root application shell + navigation between screens.
  // Part of sprint task: "coding – character movement and reactions"
  // Implemented by: Milan Klimek, November 2025

  const base = import.meta.env.BASE_URL;

  type View =
    | "menu"
    | "player"
    | "howto"
    | "map"
    | "category"
    | "game"
    | "final"
    | "settings"
    | "credits"
    | "scores";

  // Single score entry for local high-score table
  type ScoreEntry = {
    name: string;
    score: number;
    total: number;
    date: string; // ISO string
  };

  let view: View = "menu";
  $: {
  if (view === "map") {
    document.body.classList.add("mapselect");
  } else {
    document.body.classList.remove("mapselect");
  }
}
  let playerName = "";
  let continent = "";
  let category = "";
  let categoryName = "";
  let categoryColor = "#ffffff";
  let lastScore = 0;
  let lastTotal = 0;

  // Background music
  let audio: HTMLAudioElement | null = null;

  // Update audio volume and play/pause when settings change
  $: if (audio) {
    audio.volume = $settings.volume / 100;
    if ($settings.music) {
      audio.play().catch((err) => console.error("Audio play failed:", err));
    } else {
      audio.pause();
    }
  }

  // Local high-score table (top 10 per browser / per device)
  let bestScores: ScoreEntry[] = [];

  // Remembers from which continent the player should start walking next time
  // (used by MapSelect to place the character on the last continent).
  let lastContinentId: string | null = null;

  // Sprites used by WalkFrames (map + in-game reactions).
  // Preloading them removes the first-time flicker on the web build.
  const heroSprites = [
    "anim/char/player_walk1.png",
    "anim/char/player_walk2.png",
    "anim/char/player_idle.png",
    "anim/char/player_cheer1.png",
    "anim/char/player_cheer2.png",
    "anim/char/player_fall.png",
  ];

  onMount(() => {
    // Global background image for the whole app
    document.documentElement.style.setProperty(
      "--bg-img",
      `url('${base}img/bg-world.webp')`
    );

    // Preload hero sprites to avoid flicker on first use
    heroSprites.forEach((path) => {
      const img = new Image();
      img.src = `${base}${path}`;
    });

    // Restore last used player name from localStorage (if any)
    const savedName = localStorage.getItem("spoznaj-svet-playerName");
    if (savedName) {
      playerName = savedName;
    }

    // Restore local high-score table from localStorage (if any)
    const savedScores = localStorage.getItem("spoznaj-svet-bestScores");
    if (savedScores) {
      try {
        const parsed = JSON.parse(savedScores) as ScoreEntry[];
        if (Array.isArray(parsed)) {
          bestScores = parsed;
        }
      } catch {
        // If parsing fails, start with empty table
        bestScores = [];
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && view !== "game" && view !== "map") {
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  // Update local high-score table and persist to localStorage (JSON)
  function saveBestScore(name: string, score: number, total: number) {
    const safeName = name.trim() || "Unknown player";

    const newEntry: ScoreEntry = {
      name: safeName,
      score,
      total,
      date: new Date().toISOString(),
    };

    bestScores = [...bestScores, newEntry]
      // Sort by score (desc), then by total (desc) as a tie-breaker
      .sort((a, b) => {
        if (b.score === a.score) {
          return b.total - a.total;
        }
        return b.score - a.score;
      })
      // Keep only top 10 entries
      .slice(0, 10);

    localStorage.setItem("spoznaj-svet-bestScores", JSON.stringify(bestScores));
  }

  // Called when a category is picked on CategorySelect
  function handleCategoryPick(cat: { id: string, name: string, color: string }) {
    category = cat.id;
    categoryName = cat.name;
    categoryColor = cat.color;
    view = "map";
  }

  // Called when a continent is picked on MapSelect
  function handleContinentPick(c: string) {
    continent = c;
    // Remember last continent for the map character
    lastContinentId = c;
    view = "game";
  }

  // Called when a quiz round is finished
  function handleFinished(score: number, total: number) {
    lastScore = score;
    lastTotal = total;

    // Update local high-score table (per browser / per device)
    saveBestScore(playerName, score, total);

    // lastContinentId is kept so the character can stand on that continent
    view = "final";
  }

  // Called when the player confirms their name on PlayerName screen
  function handlePlayerConfirm(name: string) {
    playerName = name;
    localStorage.setItem("spoznaj-svet-playerName", name);
    view = "category";
  }

  let isPaused = false;
  let viewBeforeSettings: View | null = null;

  function togglePause() {
    if (view !== "menu") {
      isPaused = !isPaused;
    }
  }

  function openSettingsFromPause() {
    viewBeforeSettings = view;
    isPaused = false;
    view = "settings";
  }

  function openSettings() {
    viewBeforeSettings = view;
    view = "settings";
  }

  function closeSettings() {
    if (viewBeforeSettings) {
      const targetView = viewBeforeSettings;
      viewBeforeSettings = null;
      view = targetView;
    } else {
      go("menu");
    }
  }

  function closeSettingsFromPause() {
    if (viewBeforeSettings) {
      view = viewBeforeSettings;
      viewBeforeSettings = null;
      isPaused = true;
    } else {
      go("menu");
    }
  }

  // Central navigation function
  function go(to: View) {
    // Start music on first user interaction
    startMusic();

    if (to === "menu") {
      // Hard reset of character path:
      // when we go back to the main menu, we forget the last continent.
      // Next time the game starts, the character appears from the side button
      // instead of standing on the map.
      lastContinentId = null;
      isPaused = false; // Ensure pause menu is closed when navigating to main menu
    }

    view = to;
  }

  function startMusic() {
    if (!audio) {
      audio = new Audio(`${base}data/sounds/ambient.mp3`);
      audio.loop = true;
      audio.volume = $settings.volume / 100;
      audio.play().catch((err) => console.error("Audio play failed:", err));
    }
  }
</script>

<nav class="nav">
  <div class="brand">Spoznaj svet</div>
  <div class="spacer"></div>
  <button on:click={openSettings}>Nastavenia</button>
  <button on:click={() => go("credits")}>Credits</button>
</nav>

<div class="app-wrapper">
  <div class="app-content" class:disabled={isPaused}>
    {#if view === "menu"}
      <MainMenu
        onStart={() => { startMusic(); view = "player"; }}
        onHowTo={() => go("howto")}
        onSettings={() => go("settings")}
        onCredits={() => go("credits")}
        onScores={() => go("scores")}
      />
    {:else if view === "player"}
      <PlayerName
        currentName={playerName}
        on:confirm={(e) => handlePlayerConfirm(e.detail.name)}
        on:back={() => go("menu")}
      />
    {:else if view === "howto"}
      <HowTo onBack={() => go("menu")} onNext={() => go("category")} />
    {:else if view === "category"}
      <CategorySelect onPickCategory={handleCategoryPick} onBack={() => go("player")} />
    {:else if view === "map"}
      <MapSelect onPick={handleContinentPick} {lastContinentId} {categoryColor} {categoryName} onBack={() => go("category")} onMenu={() => go("menu")} />
    {:else if view === "game"}
      <Game {continent} {category} onFinished={handleFinished} onQuit={() => go("menu")} />
    {:else if view === "final"}
      <FinalScore
        score={lastScore}
        total={lastTotal}
        onRestart={() => go("category")}
        onMap={() => go("map")}
        onMenu={() => go("menu")}
      />
    {:else if view === "settings"}
      <Settings onBack={viewBeforeSettings ? (isPaused ? closeSettingsFromPause : closeSettings) : () => go("menu")} />
    {:else if view === "credits"}
      <Credits onBack={() => go("menu")} />
    {:else if view === "scores"}
      <HighScores onBack={() => go("menu")} />
    {/if}
  </div>

  {#if isPaused}
    <div class="pause-menu-overlay">
      <PauseMenu 
        onResume={togglePause} 
        onSettings={openSettingsFromPause} 
        onMenu={() => go("menu")} 
      />
    </div>
  {/if}
</div>

<style>
  .nav {
    position: sticky;
    top: 0;
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 16px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
  }

  .brand {
    font-weight: 800;
  }

  .spacer {
    flex: 1;
  }

  .nav button {
    border: 1px solid var(--border);
    background: var(--surface);
    padding: 8px 12px;
    border-radius: 10px;
    box-shadow: var(--shadow);
    cursor: pointer;
  }

  .app-wrapper {
    position: relative;
  }

  .app-content.disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  .pause-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
