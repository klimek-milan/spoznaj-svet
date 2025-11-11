<script lang="ts">
  import Menu from "./lib/Menu.svelte";
  import Game from "./lib/Game.svelte";
  import Help from "./lib/Help.svelte";
  import Thanks from "./lib/Thanks.svelte";
  type View = "menu" | "game" | "help" | "thanks";
  let view: View = "menu";
</script>

{#if view === "menu"}
  <Menu onStart={() => view="game"} onHelp={() => view="help"} onThanks={() => view="thanks"} />
{:else if view === "help"}
  <Help onBack={() => view="menu"} />
{:else if view === "thanks"}
  <Thanks onBack={() => view="menu"} />
{:else}
  <Game />
{/if}