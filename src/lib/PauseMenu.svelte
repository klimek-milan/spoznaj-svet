<script lang="ts">
  export let onResume: () => void = () => {};
  export let onSettings: () => void = () => {};
  export const onQuit: () => void = () => {};
  export let onMenu: () => void = () => {};
</script>

<div class="pause-menu-overlay">
  <div class="pause-menu" on:click|stopPropagation>
    <h2>Pauza</h2>
    <button on:click={onResume}>Pokračovať</button>
    <button on:click={() => { onSettings(); }}>Nastavenia</button>
    <button on:click={onMenu}>Hlavné menu</button>
  </div>
</div>

<style>
  .pause-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

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
</style>