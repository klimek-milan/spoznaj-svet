<script lang="ts">
  import { onMount } from "svelte";

  // Props from parent (App.svelte)
  export let score: number;          // number of correct answers
  export let total: number;          // total number of questions
  export let onRestart: () => void;  // callback: back to category selection
  export let onMap: () => void;      // callback: back to continent selection
  export let onMenu: () => void;     // callback: back to main menu

  // Local best score (loaded from high-score table)
  let bestScore = 0;

  onMount(() => {
    const raw = localStorage.getItem("spoznaj-svet-bestScores");
    if (!raw) return;

    try {
      const table = JSON.parse(raw);
      if (Array.isArray(table) && table.length > 0) {
        bestScore = table[0].score;
      }
    } catch {
      bestScore = 0;
    }
  });
</script>

<section class="done">
  <div class="card">
    <h1>Výsledné skóre</h1>
    <p><b>{score}</b> / {total}</p>
    <p>Najlepšie skóre: <b>{bestScore}</b></p>

    <div class="row">
      <button on:click={onRestart}>Vybrať kategóriu</button>
      <button on:click={onMap}>Vybrať kontinent</button>
    </div>
    <div class="row">
      <button on:click={onMenu}>Do hlavného menu</button>
    </div>
  </div>
</section>

<style>
  .done {
    min-height: 100dvh;
    display: grid;
    place-items: center;
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 22px;
    box-shadow: var(--shadow);
    text-align: center;
    min-width: 320px;
  }
  .row {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 8px;
  }
  button {
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
  }
</style>