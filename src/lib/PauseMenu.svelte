<script lang="ts">
  export let onResume: () => void = () => {};
  export let onSettings: () => void = () => {};
  export const onQuit: () => void = () => {};
  export let onMenu: () => void = () => {};

  let showConfirmDialog = false;

  function confirmMenu() {
    showConfirmDialog = true;
  }

  function cancelMenu() {
    showConfirmDialog = false;
  }

  function proceedMenu() {
    showConfirmDialog = false;
    onMenu();
  }
</script>

<div class="pause-menu" on:click|stopPropagation>
  <h2>Pauza</h2>
  <button on:click={onResume}>Pokračovať</button>
  <button on:click={() => { onSettings(); }}>Nastavenia</button>
  <button on:click={confirmMenu}>Hlavné menu</button>
</div>

{#if showConfirmDialog}
  <div class="dialog-overlay" on:click={cancelMenu}>
    <div class="dialog-box" on:click|stopPropagation>
      <h2>Návrat do menu?</h2>
      <p>Naozaj sa chceš vrátiť do hlavného menu? Všetok progres bude stratený.</p>
      <div class="dialog-buttons">
        <button class="dialog-cancel" on:click={cancelMenu}>Zrušiť</button>
        <button class="dialog-confirm" on:click={proceedMenu}>Hlavné menu</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .pause-menu {
    background: var(--surface);
    padding: 20px;
    border-radius: 10px;
    box-shadow: var(--shadow);
    text-align: center;
  }

  .pause-menu h2 {
    margin-bottom: 20px;
  }

  .pause-menu button {
    display: block;
    margin: 10px auto;
    padding: 10px 12px; /* Match padding from PlayerName.svelte */
    border-radius: 10px; /* Match border radius */
    border: 1px solid var(--border); /* Match border style */
    background: var(--surface); /* Match background color */
    color: var(--text); /* Match text color */
    font: inherit; /* Match font style */
    cursor: pointer;
    box-shadow: var(--shadow); /* Match shadow */
  }

  .pause-menu button:hover {
    background: #f3f4f6; /* Match hover background */
  }

  /* Confirmation dialog */
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1001;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dialog-box {
    background: var(--surface);
    padding: 24px;
    border-radius: 16px;
    box-shadow: var(--shadow);
    text-align: center;
    max-width: 400px;
    min-width: 320px;
  }

  .dialog-box h2 {
    margin: 0 0 12px 0;
    font-size: 1.5em;
  }

  .dialog-box p {
    margin: 0 0 20px 0;
    color: var(--muted);
  }

  .dialog-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .dialog-cancel,
  .dialog-confirm {
    padding: 10px 20px;
    border-radius: 12px;
    border: 1px solid var(--border);
    cursor: pointer;
    box-shadow: var(--shadow);
    font: inherit;
    font-weight: 600;
  }

  .dialog-cancel {
    background: var(--surface);
    color: var(--text);
  }

  .dialog-cancel:hover {
    background: #f3f4f6;
  }

  .dialog-confirm {
    background: #dc2626;
    color: white;
    border-color: #dc2626;
  }

  .dialog-confirm:hover {
    background: #b91c1c;
  }
</style>