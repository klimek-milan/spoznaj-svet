<script lang="ts">
  import { onMount } from "svelte";
  import MainMenu from "./lib/MainMenu.svelte";
  import HowTo from "./lib/HowTo.svelte";
  import MapSelect from "./lib/MapSelect.svelte";
  import Game from "./lib/Game.svelte";
  import FinalScore from "./lib/FinalScore.svelte";
  import Settings from "./lib/Settings.svelte";
  import Credits from "./lib/Credits.svelte";
  import WalkFrames from "./lib/WalkFrames.svelte";

  const base = import.meta.env.BASE_URL;

  type View = "menu" | "howto" | "map" | "game" | "final" | "settings" | "credits";
  let view: View = "menu";
  let continent = "europe";
  let lastScore = 0, lastTotal = 0;

  onMount(() => {
    // globálne pozadie (ak chceš iné, zmeň súbor)
    document.documentElement.style.setProperty("--bg-img", `url('${base}img/bg-world.webp')`);
  });

  function startGame(c: string) { continent = c; view = "game"; }
  function handleFinished(score: number, total: number) { lastScore = score; lastTotal = total; view = "final"; }
  function go(to: View) { view = to; }
</script>

<nav class="nav">
  <div class="brand">Spoznaj svet</div>
  <div class="spacer"></div>
  <button on:click={() => go("settings")}>Nastavenia</button>
  <button on:click={() => go("credits")}>Credits</button>
</nav>

<!-- POSTAVIČKA – zobraziť na menu a na mape -->
{#if view === "menu" || view === "map"}
  <WalkFrames
    folder="anim/char" 
    action="walk"
    frames={2}
    speed={8}
    size={140}
    x={24}
    y={24}
    flip={false}
    across={true}
  />
{/if}

{#if view === "menu"}
  <MainMenu
    onStart={() => go("map")}
    onHowTo={() => go("howto")}
    onSettings={() => go("settings")}
    onCredits={() => go("credits")}
  />
{:else if view === "howto"}
  <HowTo onBack={() => go("menu")} onNext={() => go("map")} />
{:else if view === "map"}
  <MapSelect onPick={startGame} />
{:else if view === "game"}
  <Game continent={continent} onFinished={handleFinished} />
{:else if view === "final"}
  <FinalScore score={lastScore} total={lastTotal} onRestart={() => go("map")} onMap={() => go("map")} />
{:else if view === "settings"}
  <Settings onBack={() => go("menu")} />
{:else if view === "credits"}
  <Credits onBack={() => go("menu")} />
{/if}

<style>
  .nav{position:sticky;top:0;display:flex;gap:8px;align-items:center;
       padding:10px 16px;background:var(--bg);border-bottom:1px solid var(--border)}
  .brand{font-weight:800}.spacer{flex:1}
  .nav button{border:1px solid var(--border);background:var(--surface);
              padding:8px 12px;border-radius:10px;box-shadow:var(--shadow);cursor:pointer}
</style>
