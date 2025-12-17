<script lang="ts">export let onNext = () => {}; export let onBack = () => {};</script>

<section class="page">
  <h1>Návod</h1>
  <ol>
    <li>Vyber si kontinent.</li>
    <li>Pozri si otázku a zvoľ správnu odpoveď.</li>
    <li>Po odpovedi uvidíš vysvetlenie a fakty.</li>
    <li>Za správnu odpoveď získaš bod. Na konci vidíš skóre.</li>
  </ol>
  <div class="row">
    <button on:click={onBack}>Späť</button>
    <button on:click={onNext}>Pokračovať</button>
  </div>
</section>

<style>
  .page {
    max-width: 900px;
    margin: 40px auto;
    padding: 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    box-shadow: var(--shadow);
    color: #000; /* Match text color from MainMenu.svelte */
  }

  .row {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  button {
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
    color: #000; /* Match button text color from MainMenu.svelte */
  }
</style>
