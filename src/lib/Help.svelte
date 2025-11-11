<script lang="ts">
  export let onBack: () => void = () => {};
  export let onNext: () => void = () => {};
</script>

<section class="wrap">
  <h1>Návod</h1>
  <p>Po spustení si pozri krátke intro video a potom odpovedz na otázku.
     Za správnu odpoveď získaš bod. Na konci uvidíš svoje skóre.</p>

  <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:12px">
    <button class="btn" on:click={onBack}>Späť</button>
    <button class="btn" on:click={onNext}>Pokračovať</button>
  </div>
</section>

<style>
  .wrap{
    max-width:900px; margin:40px auto; padding:16px;
    background:var(--surface); border:1px solid var(--border);
    border-radius:18px; box-shadow:var(--shadow);
  }
  .btn{
    padding:10px 14px; border:1px solid var(--border);
    border-radius:12px; background:var(--surface); cursor:pointer;
    box-shadow:var(--shadow);
  }
  .btn:hover{ transform:translateY(-1px) }
  .btn:active{ transform:translateY(0) }
</style>
