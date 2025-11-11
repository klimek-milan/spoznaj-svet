<script lang="ts">export let onBack = () => {};</script>

<section class="page">
  <h1>Credits</h1>
  <ul>
    <li>Milan Klimek</li>
    <li>Roman</li>
    <li>Vadym</li>
    <li>Martin</li>
    <li>© 2025</li>
  </ul>
  <button on:click={onBack}>Späť</button>
</section>

<style>
  .page{max-width:600px;margin:40px auto;padding:18px;background:var(--surface);
        border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow)}
  ul{margin-left:18px}
  button{margin-top:12px;padding:10px 14px;border:1px solid var(--border);
         border-radius:12px;background:var(--surface)}
</style>
