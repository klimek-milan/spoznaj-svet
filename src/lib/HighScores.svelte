<script lang="ts">
    import { onMount } from "svelte";
  
    type ScoreEntry = {
      name: string;
      score: number;
      total: number;
      date: string;
    };
  
    let scores: ScoreEntry[] = [];
  
    onMount(() => {
      const raw = localStorage.getItem("spoznaj-svet-bestScores");
      if (!raw) return;
  
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          scores = parsed;
        }
      } catch {
        scores = [];
      }
    });
  
    export let onBack: () => void = () => {};
  </script>
  
  <section class="scores">
    <div class="card">
      <h1>Najlepšie výsledky</h1>
  
      {#if scores.length === 0}
        <p>Žiadne skóre zatiaľ nie je uložené.</p>
      {:else}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Meno</th>
              <th>Skóre</th>
              <th>Dátum</th>
            </tr>
          </thead>
          <tbody>
            {#each scores as s, idx}
              <tr>
                <td>{idx + 1}</td>
                <td>{s.name}</td>
                <td>{s.score}/{s.total}</td>
                <td>{new Date(s.date).toLocaleString("sk-SK")}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
  
      <button class="back" on:click={onBack}>Späť</button>
    </div>
  </section>
  
  <style>
    .scores {
      min-height: 100dvh;
      display: grid;
      place-items: center;
    }
  
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 26px;
      box-shadow: var(--shadow);
      min-width: 340px;
      max-width: 480px;
    }
  
    table {
      width: 100%;
      margin-top: 12px;
      border-collapse: collapse;
    }
  
    th, td {
      padding: 8px 6px;
      text-align: center;
      border-bottom: 1px solid #ddd;
    }
  
    th {
      font-weight: 700;
    }
  
    .back {
      margin-top: 18px;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--surface);
      cursor: pointer;
    }
  </style>
  