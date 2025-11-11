<script lang="ts">
  import Menu from "./lib/Menu.svelte";
  import Help from "./lib/Help.svelte";
  import Thanks from "./lib/Thanks.svelte";

  type View = "menu" | "help" | "thanks" | "game";
  let view: View = "menu";

  // TODO: neskôr sem dáš tvoju „game“ obrazovku (video + otázky).
</script>

{#if view === "menu"}
  <Menu onStart={() => view="game"}
        onHelp={() => view="help"}
        onThanks={() => view="thanks"} />
{:else if view === "help"}
  <Help onBack={() => view="menu"} />
{:else if view === "thanks"}
  <Thanks onBack={() => view="menu"} />
{:else if view === "game"}
  <section style="max-width:900px;margin:40px auto;padding:16px;font-family:system-ui">
    <h1>Hra (demo)</h1>
    <p>Sem príde tvoje intro video + otázky. (Neskôr vymeníme za reálnu logiku.)</p>
    <button on:click={() => view="menu"} style="padding:10px 16px;border:2px solid #000;background:#fff;cursor:pointer">Späť do menu</button>
  </section>
{/if}
