<script lang="ts">export let onBack = () => {};</script>
<section class="page">
  <h1>Návod</h1>
  <p>Po spustení si pozri krátke intro video a potom odpovedz na otázku.
     Za správnu odpoveď získaš bod. Na konci uvidíš svoje skóre.</p>
  <button class="back" on:click={onBack}>Späť</button>
</section>

<style>
  .wrap{
  min-height:100dvh; display:grid; place-items:center; padding:32px; background:var(--bg);
}
.btn{
  width:min(720px,92vw); height:88px; margin:16px 0;
  border:1px solid var(--border); border-radius:16px; background:var(--surface);
  box-shadow:var(--shadow); font:800 36px/1.1 system-ui, Segoe UI, Roboto, Arial;
  letter-spacing:.5px; text-transform:uppercase; cursor:pointer;
  transition:transform .06s ease, box-shadow .1s ease, filter .15s;
}
.btn:hover{ transform:translateY(-1px); box-shadow:0 10px 26px rgba(15,23,42,.12); }
.btn:active{ transform:translateY(0); }
</style>
