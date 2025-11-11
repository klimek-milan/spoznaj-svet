<script lang="ts">
  import Splash from "./lib/Splash.svelte";
  import HowTo from "./lib/HowTo.svelte";
  import MapSelect from "./lib/MapSelect.svelte";
  import Game from "./lib/Game.svelte";
  import FinalScore from "./lib/FinalScore.svelte";
  import Settings from "./lib/Settings.svelte";
  import Credits from "./lib/Credits.svelte";

  type View = "splash" | "howto" | "map" | "game" | "final" | "settings" | "credits";
  let view: View = "splash";
  let continent = "europe";
  let lastScore = 0, lastTotal = 0;

  function startGame(c: string) { continent = c; view = "game"; }

  function handleFinished(score: number, total: number) {
    lastScore = score; lastTotal = total; view = "final";
  }

  function go(to: View) { view = to; }            // náhrada za history.back() || ...
</script>

<nav class="nav">
  <div class="brand">Spoznaj svet</div>
  <div class="spacer"></div>
  <button on:click={() => go("settings")}>Nastavenia</button>
  <button on:click={() => go("credits")}>Credits</button>
</nav>

{#if view === "splash"}
  <Splash onContinue={() => go("howto")} />
{:else if view === "howto"}
  <HowTo onBack={() => go("splash")} onNext={() => go("map")} />
{:else if view === "map"}
  <MapSelect onPick={startGame} />
{:else if view === "game"}
  <!-- TU sa props použijú korektne -->
  <Game continent={continent} onFinished={handleFinished} />
{:else if view === "final"}
  <FinalScore score={lastScore} total={lastTotal}
              onRestart={() => go("map")} onMap={() => go("map")} />
{:else if view === "settings"}
  <Settings onBack={() => go("splash")} />
{:else if view === "credits"}
  <Credits onBack={() => go("splash")} />
{/if}

<style>
  .nav{position:sticky;top:0;display:flex;gap:8px;align-items:center;
       padding:10px 16px;background:var(--bg);border-bottom:1px solid var(--border)}
  .brand{font-weight:800}.spacer{flex:1}
  .nav button{border:1px solid var(--border);background:var(--surface);
              padding:8px 12px;border-radius:10px;box-shadow:var(--shadow);cursor:pointer}
</style>
