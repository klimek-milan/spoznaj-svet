<script lang="ts">
    import { onMount } from "svelte";
    const base = import.meta.env.BASE_URL;
  
    type Opt = { code: string; text: string; correct: boolean };
    type Round = {
      image?: string;
      question: string;
      options: Opt[];
      explanation: string;
      facts: string[];
    };
  
    let rounds: Round[] = [];
    let total = 0;
    let i = 0;
    let score = 0;
    let selected: number | null = null;
    let locked = false;
  
    onMount(async () => {
      const data = await (await fetch(base + "data/questions.json")).json();
      rounds = data.rounds;
      total = data.total ?? rounds.length;
    });
  
    function pick(idx: number) {
      if (locked || !rounds[i]) return;
      selected = idx;
      locked = true;
      if (rounds[i].options[idx].correct) score++;
    }
  
    function next() {
      if (!locked) return;
      i++;
      selected = null;
      locked = false;
    }
  
    $: progress = total ? (i + (locked ? 1 : 0)) / total : 0;
  </script>
  
  {#if rounds[i]}
  <div class="layout" style={`--img:${rounds[i].image ? `url('${base + rounds[i].image}')` : 'none'}`}>
    <!-- TOP -->
    <header class="top">
      <div class="score">Score: <b>{score}</b> / {total}</div>
      <div class="progress">
        <div class="bar"><span style={`width:${Math.min(progress*100,100)}%`}></span></div>
        <div class="ratio">{i + (locked ? 1 : 0)} / {total}</div>
      </div>
    </header>
  
    <!-- ĽAVO: feedback -->
    <aside class="left">
      {#if locked}
        <div class="feedback">
          <h3>{rounds[i].explanation}</h3>
          <ul>{#each rounds[i].facts as f}<li>{f}</li>{/each}</ul>
          <button class="next" on:click={next}>Ďalej</button>
        </div>
      {:else}
        <div class="hint">Zvoľ odpoveď → tu sa zobrazí vysvetlenie a fakty.</div>
      {/if}
    </aside>
  
    <!-- STRED: otázka -->
    <main class="center">
      <div class="bubble">{rounds[i].question}</div>
    </main>
  
    <!-- DOLE: tri odpovede v jednom rade -->
    <section class="answers">
      {#each rounds[i].options as o, idx}
        <button
          class="card {locked ? (o.correct ? 'ok' : (selected===idx ? 'bad' : '')) : (selected===idx ? 'chosen' : '')}"
          on:click={() => pick(idx)}
          disabled={locked}
        >
          <div class="code">{o.code}</div>
          <div class="text">{o.text}</div>
        </button>
      {/each}
    </section>
  </div>
  {:else}
  <section class="done">
    <h1>Hotovo!</h1>
    <p>Tvoje skóre: <b>{score}</b> / {total}</p>
  </section>
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
      gap:20px; padding:24px; min-height:100dvh;
      background: var(--bg);
      color: var(--text);
      position: relative;
    }
    .layout::before{
      content:""; position:absolute; inset:0; z-index:0;
      background-image: var(--img);
      background-size: cover; background-position: center;
      opacity:.10; pointer-events:none;
    }
    header, .left, .center, .answers { position:relative; z-index:1; }
  
    /* TOP */
    header.top{
      grid-area: top;
      display:grid; grid-template-columns: 300px 1fr; align-items:center;
    }
    .score{
      justify-self:start;
      background:var(--surface); border:1px solid var(--border);
      border-radius:999px; padding:10px 14px; box-shadow:var(--shadow);
    }
    .progress{
      justify-self:center; display:flex; align-items:center; gap:12px;
      width:min(980px, 72vw);
    }
    .bar{
      flex:1; height:14px; background:#EEF2FF; border:1px solid #E5E7EB;
      border-radius:999px; overflow:hidden;
    }
    .bar span{ display:block; height:100%; background:linear-gradient(90deg,#60A5FA,#818CF8); }
    .ratio{
      background:var(--surface); border:1px solid var(--border);
      border-radius:12px; padding:6px 10px; box-shadow:var(--shadow);
    }
  
    /* LEFT */
    .left{
      grid-area:left;
      background:var(--surface); border:1px solid var(--border);
      border-radius:18px; padding:18px; box-shadow:var(--shadow);
      min-height: 420px;
    }
    .hint{ color:var(--muted); }
    .feedback h3{ margin:0 0 8px 0; }
    .feedback ul{ margin:0 0 12px 18px; }
    .next{
      padding:10px 16px; border-radius:12px; border:1px solid var(--border);
      background:var(--surface); cursor:pointer; box-shadow:var(--shadow);
    }
  
    /* CENTER – otázka */
    .center{ grid-area:center; display:grid; place-items:center; }
    .bubble{
      background:var(--surface); border:1px solid var(--border);
      border-radius:16px; padding:20px 24px; font-size:24px;
      box-shadow:var(--shadow); max-width:min(1000px, 80vw); text-align:center;
      color:var(--text);
    }
  
    /* ANSWERS – tri karty v rade */
    .answers{
      grid-area:answers;
      display:flex; justify-content:center; align-items:center;
      gap:20px; flex-wrap:wrap;
    }
    .card{
      display:grid; grid-template-columns:86px 1fr; align-items:center;
      width:min(420px, 30vw); min-width:260px;
      background:var(--surface); border:2px solid var(--border);
      border-radius:22px; padding:16px; text-align:left; cursor:pointer;
      box-shadow:var(--shadow);
      transition:transform .06s ease, box-shadow .1s ease, border-color .2s, background .2s;
    }
    .card:hover{ transform: translateY(-1px); box-shadow:0 10px 26px rgba(15,23,42,.12); }
    .card:disabled{ cursor:default; }
  
    .code{
      width:74px; height:74px; display:grid; place-items:center;
      background:#F1F5F9; border:1px solid var(--border);
      border-radius:16px; font-weight:900; font-size:26px; color:var(--text);
    }
    .text{ padding-left:14px; font-size:18px; color:var(--text) }
  
    /* zvýraznenie */
    .card.chosen{ border-color:#93C5FD; background:#F0F9FF; }
    .card.ok{    border-color:#16A34A; background:#ECFDF5; box-shadow:0 0 0 4px rgba(22,163,74,.15), var(--shadow); }
    .card.bad{   border-color:#DC2626; background:#FEF2F2; box-shadow:0 0 0 4px rgba(220,38,38,.12), var(--shadow); }
  
    /* DONE */
    .done{ min-height:100dvh; display:grid; place-items:center; text-align:center; }
  </style>
  