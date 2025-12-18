<script lang="ts">
  export let onPickCategory = (category: { id: string, name: string, color: string }) => {};
  export let onBack = () => {};

  // Example categories, you can load these dynamically if needed
  const categories = [
    { id: "geography", name: "Geografia", color: "#68d678" },
    { id: "capitals", name: "Hlavné mestá", color: "#dec55e" },
    { id: "history", name: "História", color: "#945ede" }
  ];
</script>

<section class="page">
  <h1 class="title">Vyber kategóriu otázok</h1>
  <div class="grid">
    {#each categories as cat}
      <button class="card" style="background: {cat.color};" on:click={() => onPickCategory(cat)}>
        <div class="text">{cat.name}</div>
      </button>
    {/each}
  </div>
  <div class="actions">
    <button class="back" on:click={onBack}>Späť</button>
  </div>
</section>

<style>
  .page{max-width:1100px;margin:0 auto;padding:8px;min-height:calc(100dvh - 64px);display:flex;flex-direction:column;justify-content:center;align-items:center}
  .grid{display:flex;flex-direction:column;gap:16px;align-items:center;max-width:500px;margin:0 auto}
  .card{padding:16px;border:2px solid var(--border);border-radius:22px;
        background:var(--surface);box-shadow:var(--shadow);text-align:center;cursor:pointer;width:100%;transition:all 0.2s}
  .card:hover{transform:scale(1.05);box-shadow:0 8px 16px rgba(0,0,0,0.2)}
  .text{font-weight:700;font-size:1.2em;color:white;text-shadow:1px 1px 2px rgba(0,0,0,0.3)}
  .actions{display:flex;justify-content:center;margin-top:24px}
  .back{padding:10px 20px;border-radius:12px;border:1px solid var(--border);
        background:var(--surface);cursor:pointer;box-shadow:var(--shadow)}
      .title{
            color: white;
    font-weight: 800;
    -webkit-text-stroke: 1px black;
    text-shadow:
       3px 3px 0 #000,
     -1px -1px 0 #000,  
      1px -1px 0 #000,
      -1px 1px 0 #000,
       1px 1px 0 #000;
      }
</style>
