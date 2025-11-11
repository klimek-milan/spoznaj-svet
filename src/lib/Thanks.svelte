<script lang="ts">export let onBack = () => {};</script>
<section class="page">
  <h1>Poďakovanie</h1>
  <p>Ďakujeme všetkým, ktorí prispeli na hre „Spoznaj svet“ — autorom otázok,
     kameramanom a spolužiakom za testovanie.</p>
  <button class="back" on:click={onBack}>Späť</button>
</section>

<style>
  .page{max-width:900px;margin:40px auto;padding:16px;font-family:system-ui}
  .back{padding:10px 16px;border:2px solid #000;background:#fff;cursor:pointer}
</style>
