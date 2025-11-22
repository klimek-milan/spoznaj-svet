<script lang="ts">
    export let onPick = (c:string)=>{}; // Will now redirect to category select
    const continents = [
      { id:"europe",  name:"Európa" },
      { id:"asia",    name:"Ázia" },
      { id:"africa",  name:"Afrika" },
      { id:"na",      name:"Severná Amerika" },
      { id:"sa",      name:"Južná Amerika" },
      { id:"oceania", name:"Oceánia" }
    ];
  </script>
  
  <section class="page">
    <h1>Vyber kontinent</h1>
    <div class="grid">
      {#each continents as c}
        <button class="card" on:click={() => onPick(c.id)}>
          <div class="code">{c.id.toUpperCase()}</div>
          <div class="text">{c.name}</div>
        </button>
      {/each}
    </div>
  </section>
  
  <style>
    .page{max-width:1100px;margin:40px auto;padding:8px}
    .grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
    .card{display:grid;grid-template-columns:86px 1fr;align-items:center;
          padding:16px;border:2px solid var(--border);border-radius:22px;
          background:var(--surface);box-shadow:var(--shadow);text-align:left;cursor:pointer}
    .code{width:74px;height:74px;display:grid;place-items:center;background:#F1F5F9;
          border:1px solid var(--border);border-radius:16px;font-weight:900}
    .text{padding-left:14px}
  </style>
  