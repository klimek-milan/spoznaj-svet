<script lang="ts">
    export let onContinue = () => {};
    const title = "Spoznaj svet";
  </script>
  
  <section class="wrap">
    <button class="start" on:click={onContinue}
            on:keydown={(e)=> (e.key==='Enter'||e.key===' ') && onContinue()}>
      <h1>Spoznaj svet</h1>
      <p>Klikni pre pokračovanie</p>
    </button>
  </section>
  
  <style>
    .wrap{min-height:100dvh;display:grid;place-items:center;background:var(--bg)}
    .start{border:1px solid var(--border);background:var(--surface);padding:24px;border-radius:18px;box-shadow:var(--shadow);cursor:pointer}
    .start h1{margin:0}
  </style>
  