<script lang="ts">
    import { createEventDispatcher } from "svelte";
  
    // Aktuálne uložené meno (ak už niekto hral predtým)
    export let currentName: string = "";
  
    const dispatch = createEventDispatcher<{
      confirm: { name: string };
      back: void;
    }>();
  
    let newName = "";
    let isChangingName = false;
  
    function startAsExisting() {
      const name = currentName.trim();
      if (!name) return;
      dispatch("confirm", { name });
    }
  
    function startWithNew() {
      const name = newName.trim();
      if (!name) return;
      dispatch("confirm", { name });
    }
  </script>
  
  <section class="player">
    <h2>Zadaj meno hráča</h2>
  
    {#if currentName}
      <!-- Už máme meno z minula -->
      <p>
        Minule hral: <strong>{currentName}</strong>.<br />
        Pokračuješ ako ten istý hráč?
      </p>
  
      <div class="buttons">
        <button on:click={startAsExisting}>Áno, som to ja</button>
        <button class="secondary" on:click={() => (isChangingName = true)}>
          Nie, iný hráč
        </button>
        <button class="secondary" on:click={() => dispatch("back")}>Späť</button>
      </div>
  
      {#if isChangingName}
        <div class="new-player">
          <label for="name">Nové meno hráča</label>
          <input
            id="name"
            bind:value={newName}
            on:keydown={(e) => e.key === "Enter" && startWithNew()}
          />
          <button on:click={startWithNew}>Pokračovať ako nový hráč</button>
        </div>
      {/if}
    {:else}
      <!-- Prvé spustenie – meno ešte nepoznáme -->
      <p>Zadaj svoje meno, aby sme vedeli, kto hrá:</p>
      <input
        id="name"
        bind:value={newName}
        placeholder="Tvoje meno"
        on:keydown={(e) => e.key === "Enter" && startWithNew()}
      />
      <div class="buttons">
        <button on:click={startWithNew}>Začať hru</button>
        <button class="secondary" on:click={() => dispatch("back")}>Späť</button>
      </div>
    {/if}
  </section>
  
  <style>
    .player {
      max-width: 480px;
      margin: 40px auto;
      padding: 24px;
      border-radius: var(--radius);
      background: var(--surface);
      box-shadow: var(--shadow);
    }
  
    h2 {
      margin-top: 0;
      margin-bottom: 12px;
    }
  
    p {
      margin-bottom: 16px;
    }
  
    input {
      width: 100%;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--border);
      font: inherit;
      box-sizing: border-box;
      margin-bottom: 12px;
    }
  
    .buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  
    .secondary {
      background: #f3f4f6;
    }
  
    .new-player {
      margin-top: 16px;
    }
  </style>
