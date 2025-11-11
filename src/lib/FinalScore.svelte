<script lang="ts">
    export let score = 0;
    export let total = 0;
    export let onRestart = () => {};
    export let onMap = () => {};
  </script>
  
  <section class="done">
    <div class="card">
      <h1>Výsledné skóre</h1>
      <p><b>{score}</b> / {total}</p>
      <div class="row">
        <button on:click={onRestart}>Hrať znova</button>
        <button on:click={onMap}>Vybrať kontinent</button>
      </div>
    </div>
  </section>
  
  <style>
    .done{min-height:100dvh;display:grid;place-items:center}
    .card{background:var(--surface);border:1px solid var(--border);border-radius:18px;
          padding:22px;box-shadow:var(--shadow);text-align:center;min-width:320px}
    .row{display:flex;gap:12px;justify-content:center;margin-top:8px}
    button{padding:10px 14px;border:1px solid var(--border);border-radius:12px;background:var(--surface)}
  </style>
  