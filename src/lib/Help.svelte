<script lang="ts">export let onBack = () => {};</script>
<section class="page">
  <h1>Návod</h1>
  <p>Po spustení si pozri krátke intro video a potom odpovedz na otázku.
     Za správnu odpoveď získaš bod. Na konci uvidíš svoje skóre.</p>
  <button class="back" on:click={onBack}>Späť</button>
</section>

<style>
  .page{max-width:900px;margin:40px auto;padding:16px;font-family:system-ui}
  .back{padding:10px 16px;border:2px solid #000;background:#fff;cursor:pointer}
</style>
