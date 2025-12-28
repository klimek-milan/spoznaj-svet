<script lang="ts">
  import { onMount } from "svelte";
  import { settings } from "../stores/settings";
  import WalkFrames from "./WalkFrames.svelte";
  import PauseMenu from "./PauseMenu.svelte";
  import Settings from "./Settings.svelte";

  const base = import.meta.env.BASE_URL;

  /**
   * Game screen with quiz rounds.
   *
   * Sprint 1 – quiz core:
   *   - load questions from JSON by continent + category
   *   - show image, question, answers and explanation panel
   *   - show continent / topic header and an optional hint (random fact)
   *
   * Sprint 2 – character behaviour:
   *   - character has 3 moods: idle / cheer / fall
   *   - cheer on correct answer, fall + shake on wrong answer
   *   - optional "correct" / "wrong" sounds
   */

  // Props from parent
  export let continent: string = "europe";
  export let category: string = "geography";
  export let onFinished: (score: number, total: number) => void = () => {};
  export let onQuit: () => void = () => {};

  // Types for options and rounds
  type Opt = { code: string; text: string; correct: boolean };
  type Round = {
    image?: string;
    question: string;
    options: Opt[];
    explanation: string;
  };

  // Character mood:
  //  - "idle"  -> player_idle.png
  //  - "cheer" -> player_cheer1.png + player_cheer2.png
  //  - "fall"  -> player_fall.png
  type Mood = "idle" | "cheer" | "fall";
  let mood: Mood = "idle";
  let moodTimeout: number | null = null;

  // Small shake effect for wrong answer
  let shake = false;

  // Game state
  let rounds: Round[] = [];
  let total = 0;
  let i = 0;
  let score = 0;
  let selected: number | null = null;
  let locked = false;

  // Top-level facts object from JSON
  let facts: Record<string, string[]> = {};
  let randomFact: string = "";

  // Celebration / sounds
  let celebrate = false;
  let confettiCanvas: HTMLCanvasElement;
  let sfxOk: HTMLAudioElement;
  let sfxBad: HTMLAudioElement;

  // Import settings store
  import { get } from "svelte/store";
  const s = get(settings);

  // Timer state
  let timeLeft = s.seconds;
  let timerInterval: number | null = null;

  // Pause state
  let isPaused = false;

  // Settings state
  let showSettings = false;

  // Quit confirmation dialog state
  let showQuitDialog = false;

  // Helper to get continent name from id
  function getContinentName(continentId: string): string {
    const map: Record<string, string> = {
      europe: "Európa",
      asia: "Ázia",
      africa: "Afrika",
      na: "Severná Amerika",
      sa: "Južná Amerika",
      oceania: "Oceánia"
    };
    return map[continentId] || continentId;
  }

  // Helper to get topic name from id
  function getTopicName(topicId: string): string {
    const map: Record<string, string> = {
      geography: "Geografia",
      capitals: "Hlavné mestá",
      history: "História"
    };
    return map[topicId] || topicId;
  }

  // Load questions for the selected continent on mount
  onMount(async () => {
    const resp = await fetch(base + `data/${continent}/${category}.json`);
    const data = await resp.json();
    rounds = data.rounds;
    total = data.total ?? rounds.length;
    facts = data.facts || {};
    pickRandomFact();
  });

  // Pick a random fact for the current round based on correct country code
  function pickRandomFact() {
    if (rounds[i] && Array.isArray(rounds[i].options)) {
      const correctOpt = rounds[i].options.find((o) => o.correct);
      if (
        correctOpt &&
        facts[correctOpt.code] &&
        facts[correctOpt.code].length > 0
      ) {
        const arr = facts[correctOpt.code];
        randomFact = arr[Math.floor(Math.random() * arr.length)];
        return;
      }
    }
    randomFact = "";
  }

  // Helper: set character mood for a given time and then return to "idle"
  function setMood(next: Mood, holdMs = 1500) {
    mood = next;

    if (moodTimeout !== null) {
      clearTimeout(moodTimeout);
      moodTimeout = null;
    }

    if (next !== "idle" && holdMs > 0) {
      moodTimeout = window.setTimeout(() => {
        mood = "idle";
        moodTimeout = null;
      }, holdMs);
    }
  }

  // Confetti particle system drawn on <canvas>
  function burstConfetti() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = confettiCanvas.getBoundingClientRect();
    confettiCanvas.width = width;
    confettiCanvas.height = height;

    const N = 150;
    const colors = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

    const parts = Array.from({ length: N }, () => ({
      x: width / 2,
      y: height / 3,
      vx: (Math.random() - 0.5) * 6,
      vy: -(3 + Math.random() * 4),
      g: 0.12 + Math.random() * 0.08,
      s: 4 + Math.random() * 3,
      c: colors[(Math.random() * colors.length) | 0],
      life: 120 + Math.random() * 30,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3
    }));

    let frame = 0;

    (function tick() {
      frame++;
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      for (const p of parts) {
        if (p.life-- <= 0) continue;
        alive = true;

        // Basic physics
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
        ctx.restore();
      }

      if (alive && frame < 240) requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, width, height);
    })();
  }

  // Start the timer for the current question
  function startTimer() {
    if (!s.timer) return; // Only start if timer is enabled

    timeLeft = s.seconds;
    if (timerInterval !== null) {
      clearInterval(timerInterval);
    }

    timerInterval = window.setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        if (timerInterval !== null) {
          clearInterval(timerInterval);
        }
        timerInterval = null;
        handleTimeout();
      }
    }, 1000);
  }

  // Resume the timer from current timeLeft value
  function resumeTimer() {
    if (!s.timer || timeLeft <= 0) return;

    if (timerInterval !== null) {
      clearInterval(timerInterval);
    }

    timerInterval = window.setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        if (timerInterval !== null) {
          clearInterval(timerInterval);
        }
        timerInterval = null;
        handleTimeout();
      }
    }, 1000);
  }

  // Handle timeout (mark question as incorrect)
  function handleTimeout() {
    if (locked || !rounds[i]) return;
    selected = null; // No answer selected
    locked = true;

    // Wrong answer → fall
    setMood("fall", 1500);

    // Small shake effect
    shake = true;
    setTimeout(() => (shake = false), 400);
  }

  // Reset timer when moving to the next question
  function next() {
    if (!locked) return;

    i++;
    selected = null;
    locked = false;
    shake = false;
    setMood("idle", 0);

    if (i >= total) {
      onFinished(score, total);
      return;
    }

    pickRandomFact();
    startTimer(); // Restart timer for the next question
  }

  // Handle user picking an answer
  function pick(idx: number) {
    if (locked || !rounds[i]) return;
    selected = idx;
    locked = true;

    // Stop the timer when an answer is selected
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    const correct = rounds[i].options[idx].correct;

    if (correct) {
      score++;

      // Good answer → cheer
      setMood("cheer", 1500);

      // Confetti + correct sound
      celebrate = true;
      burstConfetti();

      if (s.sound) {
        try {
          if (sfxOk) {
            sfxOk.volume = s.soundVolume / 100;
            sfxOk.currentTime = 0;
            void sfxOk.play();
          }
        } catch {
          // Ignore autoplay errors
        }
      }

      setTimeout(() => (celebrate = false), 1500);
    } else {
      // Wrong answer → fall
      setMood("fall", 1500);

      // Small shake effect
      shake = true;
      setTimeout(() => (shake = false), 400);

      // Optional "wrong" sound
      if (s.sound) {
        try {
          if (sfxBad) {
            sfxBad.volume = s.soundVolume / 100;
            sfxBad.currentTime = 0;
            void sfxBad.play();
          }
        } catch {
          // Ignore autoplay errors
        }
      }
    }
  }

  // Toggle pause state
  function togglePause() {
    isPaused = !isPaused;
    
    // Pause/resume timer when pausing
    if (isPaused) {
      if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    } else {
      // Resume timer if not locked and timer is enabled
      if (!locked && s.timer && timerInterval === null) {
        resumeTimer();
      }
    }
  }

  // Open settings and pause timer
  function openSettings() {
    isPaused = false; // Close pause menu when opening settings
    showSettings = true;
    
    // Pause timer when settings opens
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // Close settings and resume timer
  function closeSettings() {
    showSettings = false;
    
    // Resume timer if not locked and timer is enabled
    if (!locked && s.timer && timerInterval === null) {
      resumeTimer();
    }
  }

  // Show quit confirmation dialog
  function confirmQuit() {
    showQuitDialog = true;
  }

  // Cancel quit and close dialog
  function cancelQuit() {
    showQuitDialog = false;
  }

  // Confirm quit and return to menu
  function proceedQuit() {
    showQuitDialog = false;
    onQuit();
  }

  // Keyboard event handler
  onMount(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  // Derived progress value in 0..1
  $: progress = total ? (i + (locked ? 1 : 0)) / total : 0;

  // Start timer on mount
  onMount(() => {
    startTimer();
  });
</script>

{#if rounds[i]}
  <div
    class="layout"
    class:shake={shake}
    style={`--img:${rounds[i].image ? `url('${base + rounds[i].image}')` : "none"}`}
  >
    <!-- TOP: score + progress bar -->
    <header class="top">
      <div class="score">
        Score: <b>{score}</b> / {total}
      </div>
      <div class="progress">
        <div class="bar">
          <span style={`width:${Math.min(progress * 100, 100)}%`}></span>
        </div>
        <div class="ratio">{i + (locked ? 1 : 0)} / {total}</div>
      </div>
    </header>

    <!-- CENTER: question bubble -->
    <main class="center">
      <div class="bubble">
        {#if s.timer}
          <div class="timer">Čas: {timeLeft}s</div>
        {/if}
        <div class="continent-header">{getContinentName(continent)}</div>
        <div class="topic-header">Téma: {getTopicName(category)}</div>
        <div class="question">{rounds[i].question}</div>
        {#if randomFact}
          <div class="tip">
            <span class="tip-label">Tip:</span> {randomFact}
          </div>
        {/if}
      </div>
    </main>

    <!-- LEFT: feedback panel -->
    <aside class="left">
      {#if locked}
        <div class="feedback">
          <h3>{rounds[i].explanation}</h3>
          <button class="next" on:click={next}>Ďalej</button>
        </div>
      {:else}
        <div class="hint">
          Zvoľ odpoveď → tu sa zobrazí vysvetlenie a fakty.
        </div>
      {/if}
      <button class="quit" on:click={confirmQuit}>Ukončiť hru</button>
    </aside>

    <!-- BOTTOM: answer cards in a row -->
    <section class="answers">
      {#each rounds[i].options as o, idx}
        <button
          class={`card ${
            locked
              ? o.correct
                ? "ok"
                : selected === idx
                  ? "bad"
                  : ""
              : selected === idx
                ? "chosen"
                : ""
          }`}
          on:click={() => pick(idx)}
          disabled={locked}
        >
          <div class="text">{o.text}</div>
        </button>
      {/each}
    </section>
  </div>
{/if}

<!-- OVERLAY: confetti + sounds + character -->
<canvas bind:this={confettiCanvas} class="confetti"></canvas>
<audio bind:this={sfxOk} src={`${base}data/sounds/correct.mp3`} preload="auto"></audio>
<audio bind:this={sfxBad} src={`${base}data/sounds/wrong.mp3`} preload="auto"></audio>

<!-- Character:
     - idle  -> player_idle.png
     - cheer -> player_cheer1.png + player_cheer2.png
     - fall  -> player_fall.png -->
<WalkFrames
  action={mood}
  frames={mood === "cheer" ? 2 : 1}
  speed={8}
  size={160}
  x={24}
  y={24}
/>

{#if isPaused}
  <div class="pause-overlay">
    <PauseMenu 
      onResume={togglePause} 
      onSettings={openSettings}
      onMenu={onQuit}
    />
  </div>
{/if}

{#if showSettings}
  <div class="settings-overlay">
    <div class="settings-wrapper" on:click|stopPropagation>
      <Settings onBack={closeSettings} />
    </div>
  </div>
{/if}

{#if showQuitDialog}
  <div class="dialog-overlay">
    <div class="dialog-box" on:click|stopPropagation>
      <h2>Ukončiť hru?</h2>
      <p>Naozaj chceš ukončiť hru? Všetok progres bude stratený.</p>
      <div class="dialog-buttons">
        <button class="dialog-cancel" on:click={cancelQuit}>Zrušiť</button>
        <button class="dialog-confirm" on:click={proceedQuit}>Ukončiť</button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* GRID: top | (left,center) | answers */
  .layout {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 300px 1fr;
    grid-template-rows: 82px 1fr 160px;
    grid-template-areas:
      "top     top"
      "left    center"
      "left    answers";
    gap: 20px;
    padding: 24px;
    min-height: calc(100dvh - 64px); /* rovnaký princíp ako v MainMenu */
    background: var(--bg);
    color: var(--text);
    position: relative;
  }
  .layout::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    background-image: var(--img);
    background-size: cover;
    background-position: center;
    opacity: 0.1;
    pointer-events: none;
  }
  header,
  .left,
  .center,
  .answers {
    position: relative;
    z-index: 1;
  }

  /* TOP: score + progress bar */
  header.top {
    grid-area: top;
    display: grid;
    grid-template-columns: 300px 1fr;
    align-items: center;
  }
  .score {
    justify-self: start;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 10px 14px;
    box-shadow: var(--shadow);
  }
  .progress {
    justify-self: center;
    display: flex;
    align-items: center;
    gap: 12px;
    width: min(980px, 72vw);
  }
  .bar {
    flex: 1;
    height: 14px;
    background: #eef2ff;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
  }
  .bar span {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #60a5fa, #818cf8);
  }
  .ratio {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 6px 10px;
    box-shadow: var(--shadow);
  }

  /* LEFT: explanation / facts panel */
  .left {
    grid-area: left;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 18px;
    box-shadow: var(--shadow);
    min-height: 420px;
  }
  .hint {
    color: var(--muted);
  }
  .feedback h3 {
    margin: 0 0 8px 0;
  }
  .next {
    padding: 10px 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
    cursor: pointer;
    box-shadow: var(--shadow);
  }
  .quit {
    padding: 10px 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
    cursor: pointer;
    box-shadow: var(--shadow);
    margin-top: 12px;
    width: 100%;
  }

  /* CENTER: question bubble */
  .center {
    grid-area: center;
    display: grid;
    place-items: center;
  }
  .bubble {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px 24px;
    box-shadow: var(--shadow);
    max-width: min(1000px, 80vw);
    text-align: center;
    color: var(--text);
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .continent-header {
    font-size: 1.3em;
    font-weight: bold;
    color: var(--primary, #2563eb);
    margin-bottom: 4px;
  }
  .topic-header {
    font-size: 1.1em;
    font-weight: 500;
    color: var(--secondary, #3b82f6);
    margin-bottom: 14px;
    letter-spacing: 0.2px;
  }
  .question {
    font-size: 24px;
    margin-bottom: 12px;
    font-weight: 500;
    color: var(--text, #1e293b);
  }
  .tip {
    margin-top: 0;
    background: var(--surface, #f8fafc);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 17px;
    color: var(--muted, #334155);
    box-shadow: var(--shadow);
    max-width: min(800px, 70vw);
    text-align: center;
    font-style: italic;
  }
  .tip-label {
    font-weight: bold;
    color: var(--primary, #2563eb);
    margin-right: 6px;
  }

  /* ANSWERS: cards in a row */
  .answers {
    grid-area: answers;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }
  .card {
    display: grid;
    grid-template-columns: 86px 1fr;
    align-items: center;
    width: min(420px, 30vw);
    min-width: 260px;
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 22px;
    padding: 16px;
    text-align: left;
    cursor: pointer;
    box-shadow: var(--shadow);
    transition:
      transform 0.06s ease,
      box-shadow 0.1s ease,
      border-color 0.2s,
      background 0.2s;
  }
  .card:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.12);
  }
  .card:disabled {
    cursor: default;
  }

  .code {
    width: 74px;
    height: 74px;
    display: grid;
    place-items: center;
    background: #f1f5f9;
    border: 1px solid var(--border);
    border-radius: 16px;
    font-weight: 900;
    font-size: 26px;
    color: var(--text);
  }
  .text {
    padding-left: 14px;
    font-size: 18px;
    color: var(--text);
    font-weight: bold;
  }

  /* Visual states of answer cards */
  .card.chosen {
    border-color: #93c5fd;
    background: #f0f9ff;
  }
  .card.ok {
    border-color: #16a34a;
    background: #ecfdf5;
    box-shadow:
      0 0 0 4px rgba(22, 163, 74, 0.15),
      var(--shadow);
  }
  .card.bad {
    border-color: #dc2626;
    background: #fef2f2;
    box-shadow:
      0 0 0 4px rgba(220, 38, 38, 0.12),
      var(--shadow);
  }

  /* Full-screen confetti overlay */
  .confetti {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 50;
  }

  /* Shake animation for wrong answer */
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    15% {
      transform: translateX(-6px);
    }
    30% {
      transform: translateX(6px);
    }
    45% {
      transform: translateX(-4px);
    }
    60% {
      transform: translateX(4px);
    }
    75% {
      transform: translateX(-2px);
    }
    100% {
      transform: translateX(0);
    }
  }
  .layout.shake {
    animation: shake 0.4s ease-in-out;
  }

  /* Final screen – currently unused, handled by parent */
  .done {
    min-height: 100dvh;
    display: grid;
    place-items: center;
    text-align: center;
  }

  .timer {
    justify-self: end;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 10px 14px;
    box-shadow: var(--shadow);
    font-weight: bold;
    color: var(--text);
  }

  /* Quit confirmation dialog */
  .dialog-overlay {
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

  .dialog-box {
    background: var(--surface);
    padding: 24px;
    border-radius: 16px;
    box-shadow: var(--shadow);
    text-align: center;
    max-width: 400px;
    min-width: 320px;
  }

  .dialog-box h2 {
    margin: 0 0 12px 0;
    font-size: 1.5em;
  }

  .dialog-box p {
    margin: 0 0 20px 0;
    color: var(--muted);
  }

  .dialog-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .dialog-cancel,
  .dialog-confirm {
    padding: 10px 20px;
    border-radius: 12px;
    border: 1px solid var(--border);
    cursor: pointer;
    box-shadow: var(--shadow);
    font: inherit;
    font-weight: 600;
  }

  .dialog-cancel {
    background: var(--surface);
    color: var(--text);
  }

  .dialog-cancel:hover {
    background: #f3f4f6;
  }

  .dialog-confirm {
    background: #dc2626;
    color: white;
    border-color: #dc2626;
  }

  .dialog-confirm:hover {
    background: #b91c1c;
  }

  /* Pause overlay */
  .pause-overlay {
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

  /* Settings overlay */
  .settings-overlay {
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

  .settings-wrapper {
    max-height: 90vh;
    overflow-y: auto;
  }
</style>

<!-- Ensure the component is properly exported -->
