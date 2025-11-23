<script lang="ts">
  import { onMount } from "svelte";
  import MainMenu from "./lib/MainMenu.svelte";
  import HowTo from "./lib/HowTo.svelte";
  import MapSelect from "./lib/MapSelect.svelte";
  import CategorySelect from "./lib/CategorySelect.svelte";
  import Game from "./lib/Game.svelte";
  import FinalScore from "./lib/FinalScore.svelte";
  import Settings from "./lib/Settings.svelte";
  import Credits from "./lib/Credits.svelte";

  // Root application shell + navigation between screens.
  // Part of sprint task: "coding – pohyb postavičky" (character movement)
  // Implemented by: Milan Klimek, November 2025

  const base = import.meta.env.BASE_URL;

  type View =
    | "menu"
    | "howto"
    | "map"
    | "category"
    | "game"
    | "final"
    | "settings"
    | "credits";

  let view: View = "menu";
  let continent = "";
  let category = "";
  let lastScore = 0;
  let lastTotal = 0;

  // Remembers from which continent the player should start walking next time
  // (used by MapSelect to place the character on the last continent).
  let lastContinentId: string | null = null;

  onMount(() => {
    // Global background image for the whole app
    document.documentElement.style.setProperty(
      "--bg-img",
      `url('${base}img/bg-world.webp')`
    );
  });

  // Called when a category is picked on CategorySelect
  function handleCategoryPick(cat: string) {
    category = cat;
    view = "map";
  }

  // Called when a continent is picked on MapSelect
  function handleContinentPick(c: string) {
    continent = c;
    lastContinentId = c; // remember last continent for the map character
    view = "game";
  }

  // Called when a quiz round is finished
  function handleFinished(score: number, total: number) {
    lastScore = score;
    lastTotal = total;
    // lastContinentId is kept so the character can stand on that continent
    view = "final";
  }

  // Central navigation function
  function go(to: View) {
    if (to === "menu") {
      // Hard reset of character path:
      // when we go back to the main menu, we forget the last continent.
      // Next time the game starts, the character appears from the side button
      // instead of standing on the map.
      lastContinentId = null;
    }

    view = to;
  }
</script>

<nav class="nav">
  <div class="brand">Spoznaj svet</div>
  <div class="spacer"></div>
  <button on:click={() => go("settings")}>Nastavenia</button>
  <button on:click={() => go("credits")}>Credentials</button>
</nav>

{#if view === "menu"}
  <MainMenu
    onStart={() => go("category")}
    onHowTo={() => go("howto")}
    onSettings={() => go("settings")}
    onCredits={() => go("credits")}
  />
{:else if view === "howto"}
  <HowTo onBack={() => go("menu")} onNext={() => go("category")} />
{:else if view === "category"}
  <CategorySelect onPickCategory={handleCategoryPick} />
{:else if view === "map"}
  <MapSelect onPick={handleContinentPick} lastContinentId={lastContinentId} />
{:else if view === "game"}
  <Game continent={continent} category={category} onFinished={handleFinished} />
{:else if view === "final"}
  <FinalScore
    score={lastScore}
    total={lastTotal}
    onRestart={() => go("category")}
    onMap={() => go("map")}
    onMenu={() => go("menu")}
  />
{:else if view === "settings"}
  <Settings onBack={() => go("menu")} />
{:else if view === "credits"}
  <Credits onBack={() => go("menu")} />
{/if}

<style>
  .nav {
    position: sticky;
    top: 0;
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 16px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
  }

  .brand {
    font-weight: 800;
  }

  .spacer {
    flex: 1;
  }

  .nav button {
    border: 1px solid var(--border);
    background: var(--surface);
    padding: 8px 12px;
    border-radius: 10px;
    box-shadow: var(--shadow);
    cursor: pointer;
  }
</style>
