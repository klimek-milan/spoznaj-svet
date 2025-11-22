<script lang="ts">
  export let continent: string;
  export let onPickCategory = (category: string) => {};

  // Example categories, you can load these dynamically if needed
  const categories = [
    { id: "geography", name: "Geografia" },
    { id: "capitals", name: "Hlavné mestá" },
    { id: "history", name: "História" }
  ];
</script>

<section class="page">
  <h1>Vyber kategóriu otázok pre {continent}</h1>
  <div class="grid">
    {#each categories as cat}
      <button class="card" on:click={() => onPickCategory(cat.id)}>
        <div class="text">{cat.name}</div>
      </button>
    {/each}
  </div>
</section>

<style>
  .page{max-width:1100px;margin:40px auto;padding:8px}
  .grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  .card{padding:16px;border:2px solid var(--border);border-radius:22px;
        background:var(--surface);box-shadow:var(--shadow);text-align:left;cursor:pointer}
  .text{font-weight:700;font-size:1.2em}
</style>
