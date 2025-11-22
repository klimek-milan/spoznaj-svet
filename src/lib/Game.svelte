<script lang="ts">
  import { onMount } from "svelte";
  import WalkFrames from "./WalkFrames.svelte";

  const base = import.meta.env.BASE_URL;

  // Game screen with quiz rounds.
  // Sprint task: "coding – pohyb postavičky" (character movement)
  // Implemented by: Milan Klimek, November 2025
  //
  // NOTE:
  // - This file controls WHEN the character animation is shown.
  // - For this sprint we only trigger a basic "cheer" animation
  //   after a correct answer.
  // - Path / waypoint based movement between points will be added later.

  // Props from parent:
  // - continent: which JSON file with questions to load
  // - onFinished: callback when the quiz ends (score, total)
  export let continent: string = "europe";
  export let onFinished: (score: number, total: number) => void = () => {};

  // Types for options and rounds
  type Opt = { code: string; text: string; correct: boolean };
  type Round = {
    image?: string;
    question: string;
    options: Opt[];
    explanation: string;
    facts: string[];
  };

  // Game state
  let rounds: Round[] = [];
  let total = 0;
  let i = 0;
  let score = 0;
  let selected: number | null = null;
  let locked = false;

  // Celebration state for correct answer:
  // - celebrate: toggles confetti + character cheer
  // - confettiCanvas: canvas element for drawing particles
  // - sfxOk: audio element with "correct" sound
  let celebrate = false;
  let confettiCanvas: HTMLCanvasElement;
  let sfxOk: HTMLAudioElement;

  // Load questions for the selected continent on mount
  onMount(async () => {
    const data = await (await fetch(base + `data/${continent}.json`)).json();
    rounds = data.rounds;
    total = data.total ?? rounds.length;
  });

  // Simple confetti particle system drawn on <canvas>
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

        // basic physics: gravity + movement + rotation
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

      // Stop after some frames or when all particles are dead
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

      // 🎉 Celebration:
      // - enable confetti
      // - trigger character cheer animation via <WalkFrames>
      celebrate = true;
      burstConfetti();

      try {
        if (sfxOk) {
          // reset audio to the beginning and play
          sfxOk.currentTime = 0;
          // allowed because user already clicked on an answer
          void sfxOk.play();
        }
      } catch {
        // ignore audio errors (autoplay restrictions, etc.)
      }

      // Turn off cheer flag after a short time.
      // Confetti animation will finish on its own.
      setTimeout(() => (celebrate = false), 1500);
    }
  }

  // Go to the next question
  function next() {
    if (!locked) return;

    i++;
    selected = null;
    locked = false;

    // Reached the end – report score to parent
    if (i >= total) onFinished(score, total);
  }

  // Derived progress value in 0..1
  $: progress = total ? (i + (locked ? 1 : 0)) / total : 0;
</script>

{#if rounds[i]}
  <div
    class="layout"
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

    <!-- LEFT: feedback / explanation panel -->
    <aside class="left">
      {#if locked}
        <div class="feedback">
          <h3>{rounds[i].explanation}</h3>
          <ul>
            {#each rounds[i].facts as f}
              <li>{f}</li>
            {/each}
          </ul>
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
      <div class="bubble">{rounds[i].question}</div>
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

<!-- OVERLAY: confetti + sound + character cheer animation -->
<canvas bind:this={confettiCanvas} class="confetti"></canvas>
<audio bind:this={sfxOk} src={`${base}sfx/correct.mp3`} preload="auto"></audio>

{#if celebrate}
  <!-- For this sprint we only use WalkFrames for a simple cheer animation.
       Continuous / path-based movement will be added in a later iteration. -->
  <WalkFrames action="cheer" frames={2} speed={8} size={160} x={24} y={24} />
{/if}

<style>
  /* GRID: top | (left,center) | answers */
  .layout{
    display:grid;
    grid-template-columns: 300px 1fr;
    grid-template-rows: 82px 1fr 160px;
    grid-template-areas:
      "top     top"
      "left    center"
      "left    answers";
    gap:20px;
    padding:24px;
    min-height:100dvh;
    background: var(--bg);
    color: var(--text);
    position: relative;
  }
  .layout::before{
    content:"";
    position:absolute;
    inset:0;
    z-index:0;
    background-image: var(--img);
    background-size: cover;
    background-position: center;
    opacity:.10;
    pointer-events:none;
  }
  header,
  .left,
  .center,
  .answers{
    position:relative;
    z-index:1;
  }

  /* TOP: score + progress bar */
  header.top{
    grid-area: top;
    display:grid;
    grid-template-columns: 300px 1fr;
    align-items:center;
  }
  .score{
    justify-self:start;
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:999px;
    padding:10px 14px;
    box-shadow:var(--shadow);
  }
  .progress{
    justify-self:center;
    display:flex;
    align-items:center;
    gap:12px;
    width:min(980px, 72vw);
  }
  .bar{
    flex:1;
    height:14px;
    background:#EEF2FF;
    border:1px solid #E5E7EB;
    border-radius:999px;
    overflow:hidden;
  }
  .bar span{
    display:block;
    height:100%;
    background:linear-gradient(90deg,#60A5FA,#818CF8);
  }
  .ratio{
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:12px;
    padding:6px 10px;
    box-shadow:var(--shadow);
  }

  /* LEFT: explanation / facts panel */
  .left{
    grid-area:left;
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:18px;
    padding:18px;
    box-shadow:var(--shadow);
    min-height: 420px;
  }
  .hint{
    color:var(--muted);
  }
  .feedback h3{
    margin:0 0 8px 0;
  }
  .feedback ul{
    margin:0 0 12px 18px;
  }
  .next{
    padding:10px 16px;
    border-radius:12px;
    border:1px solid var(--border);
    background:var(--surface);
    cursor:pointer;
    box-shadow:var(--shadow);
  }

  /* CENTER: question bubble */
  .center{
    grid-area:center;
    display:grid;
    place-items:center;
  }
  .bubble{
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:16px;
    padding:20px 24px;
    font-size:24px;
    box-shadow:var(--shadow);
    max-width:min(1000px, 80vw);
    text-align:center;
    color:var(--text);
  }

  /* ANSWERS: three cards in a row */
  .answers{
    grid-area:answers;
    display:flex;
    justify-content:center;
    align-items:center;
    gap:20px;
    flex-wrap:wrap;
  }
  .card{
    display:grid;
    grid-template-columns:86px 1fr;
    align-items:center;
    width:min(420px, 30vw);
    min-width:260px;
    background:var(--surface);
    border:2px solid var(--border);
    border-radius:22px;
    padding:16px;
    text-align:left;
    cursor:pointer;
    box-shadow:var(--shadow);
    transition:
      transform .06s ease,
      box-shadow .1s ease,
      border-color .2s,
      background .2s;
  }
  .card:hover{
    transform: translateY(-1px);
    box-shadow:0 10px 26px rgba(15,23,42,.12);
  }
  .card:disabled{
    cursor:default;
  }

  .code{
    width:74px;
    height:74px;
    display:grid;
    place-items:center;
    background:#F1F5F9;
    border:1px solid var(--border);
    border-radius:16px;
    font-weight:900;
    font-size:26px;
    color:var(--text);
  }
  .text{
    padding-left:14px;
    font-size:18px;
    color:var(--text);
  }

  /* Visual states of answer cards */
  .card.chosen{
    border-color:#93C5FD;
    background:#F0F9FF;
  }
  .card.ok{
    border-color:#16A34A;
    background:#ECFDF5;
    box-shadow:0 0 0 4px rgba(22,163,74,.15), var(--shadow);
  }
  .card.bad{
    border-color:#DC2626;
    background:#FEF2F2;
    box-shadow:0 0 0 4px rgba(220,38,38,.12), var(--shadow);
  }

  /* Full-screen confetti overlay */
  .confetti{
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 50;
  }

  /* DONE (currently unused, final score handled by parent) */
  .done{
    min-height:100dvh;
    display:grid;
    place-items:center;
    text-align:center;
  }
</style>
