<script lang="ts">
  import { onMount } from "svelte";
  import WalkFrames from "./WalkFrames.svelte";

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

  // Handle user picking an answer
  function pick(idx: number) {
    if (locked || !rounds[i]) return;
    selected = idx;
    locked = true;

    const correct = rounds[i].options[idx].correct;

    if (correct) {
      score++;

      // Good answer → cheer
      setMood("cheer", 1500);

      // Confetti + correct sound
      celebrate = true;
      burstConfetti();

      try {
        if (sfxOk) {
          sfxOk.currentTime = 0;
          void sfxOk.play();
        }
      } catch {
        // Ignore autoplay errors
      }

      setTimeout(() => (celebrate = false), 1500);
    } else {
      // Wrong answer → fall
      setMood("fall", 1500);

      // Small shake effect
      shake = true;
      setTimeout(() => (shake = false), 400);

      // Optional "wrong" sound
      try {
        if (sfxBad) {
          sfxBad.currentTime = 0;
          void sfxBad.play();
        }
      } catch {
        // Ignore autoplay errors
      }
    }
  }

  // Move to the next question
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
  }

  // Derived progress value in 0..1
  $: progress = total ? (i + (locked ? 1 : 0)) / total : 0;
</script>

{#if rounds[i]}
  <div
    class="layout"
    class:shake={shake}
    style={`--img:${
      rounds[i].image ? `url('${base + rounds[i].image}')` : "none"
    }`}
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
    </aside>

    <!-- CENTER: question bubble -->
    <main class="center">
      <div class="bubble">
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
          <div class="code">{o.code}</div>
          <div class="text">{o.text}</div>
        </button>
      {/each}
    </section>
  </div>
{/if}

<!-- OVERLAY: confetti + sounds + character -->
<canvas bind:this={confettiCanvas} class="confetti"></canvas>
<audio bind:this={sfxOk} src={`${base}sfx/correct.mp3`} preload="auto"></audio>
<audio bind:this={sfxBad} src={`${base}sfx/wrong.mp3`} preload="auto"></audio>

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
</style>
