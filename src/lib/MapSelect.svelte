<script lang="ts">
  import { onMount } from "svelte";
  import WalkFrames from "./WalkFrames.svelte";
  import PauseMenu from "./PauseMenu.svelte";

  // Map selection screen with animated walk between continent points.
  // Sprint task: "coding – pohyb postavičky" (character movement)
  // Implemented by: Milan Klimek, November 2025
  //
  // Props from parent (App.svelte):
  // - onPick(continentId: string): callback invoked after the walk+delay
  // - lastContinentId: if set, player stands on this continent and
  //   walks from here to the next one.

  export let onPick: (continentId: string) => void;
  export let lastContinentId: string | null = null;
  export let onBack: () => void = () => {};
  export let categoryColor: string = "#ffffff";
  export let categoryName: string = "";

  const base = import.meta.env.BASE_URL;

  // Original image dimensions of mapa.png
  const MAP_WIDTH = 2560;
  const MAP_HEIGHT = 1440;

  // Debug flag: show clickable markers and labels on the map.
  // Default = false so the player uses only side buttons.
  const SHOW_DEBUG_POINTS = false;

  type RawPoint = {
    id: string; // "europe", "asia", ...
    order: number; // 1..6 for UI labels
    name: string; // "Európa"
    pxX: number; // pixel position from GIMP (original image)
    pxY: number;
  };

  type MapPoint = RawPoint & {
    x: number; // relative position in %
    y: number; // relative position in %
  };

  // Positions measured in GIMP on the original image (pixels)
  const rawPoints: RawPoint[] = [
    { id: "europe", order: 1, name: "Európa", pxX: 1220, pxY: 576 },
    { id: "africa", order: 2, name: "Afrika", pxX: 1342, pxY: 821 },
    { id: "asia", order: 3, name: "Ázia", pxX: 1831, pxY: 513 },
    {
      id: "oceania",
      order: 4,
      name: "Austrália/Oceánia",
      pxX: 2240,
      pxY: 1104,
    },
    { id: "sa", order: 5, name: "Južná Amerika", pxX: 429, pxY: 546 },
    { id: "na", order: 6, name: "Severná Amerika", pxX: 726, pxY: 1035 },
  ];

  function toPercent(p: RawPoint): MapPoint {
    const x = (p.pxX / MAP_WIDTH) * 100;
    const y = (p.pxY / MAP_HEIGHT) * 100;
    return { ...p, x, y };
  }

  const points: MapPoint[] = rawPoints.map(toPercent);

  // Left panel: 1–3, right panel: 4–6
  const leftPoints = points.filter((p) => p.order <= 3);
  const rightPoints = points.filter((p) => p.order >= 4);

  // DOM references for buttons and map markers
  let cardRefs: Record<string, HTMLElement | undefined> = {};
  let markerRefs: Record<string, HTMLElement | undefined> = {};
  let mapImg: HTMLImageElement | null = null;

  // we postpone initial placement until the map image is loaded
  let pendingInitialContinent: string | null = null;

  // Svelte actions to register/unregister DOM references
  function cardRef(node: HTMLElement, id: string) {
    cardRefs[id] = node;
    return {
      destroy() {
        delete cardRefs[id];
      },
    };
  }

  function markerRef(node: HTMLElement, id: string) {
    markerRefs[id] = node;
    return {
      destroy() {
        delete markerRefs[id];
      },
    };
  }

  // === Character (player) state ===

  const walkerSize = 140;
  const EXTRA_DELAY_MS = 1_000; // how long the player stands on the continent before switching screen

  let walking = false; // walking animation is active
  let resting = false; // player is standing on the continent

  // Position for animated walk (WalkFrames with across=true)
  let walkerX = 0;
  let walkerY = 0;
  let walkerDx = "0px";
  let walkerDy = "0px";
  let walkerFlip = false;
  let walkerDuration = 1.2;

  // Final position where the player stands (feet on the point)
  let restX = 0;
  let restY = 0;
  let restFlip = false;

  let moveTimeout: number | null = null;
  let nextTimeout: number | null = null;

  // remember continent where the player should stand
  onMount(() => {
    if (lastContinentId) {
      pendingInitialContinent = lastContinentId;
    }
  });

  // Called when the map image has finished loading.
  function handleMapLoad() {
    if (!pendingInitialContinent) return;

    const id = pendingInitialContinent;
    pendingInitialContinent = null;

    const markerEl = markerRefs[id];
    if (!markerEl) return;

    const rect = markerEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const h = window.innerHeight;
    const size = walkerSize;

    // FEET anchored to the marker (bottom-center)
    restX = cx - size / 2;
    restY = h - cy;
    restFlip = false;

    walking = false;
    resting = true;
  }

  function startWalk(continentId: string) {
    // If the player clicks the same continent where the character
    // is already standing, skip walking-in-place and go straight to the game.
    if (lastContinentId === continentId && resting) {
      onPick(continentId);
      return;
    }

    // Block only when already walking; allow click while resting
    if (walking) return;
    resting = false;

    const targetMarker = markerRefs[continentId];

    // Fallback: if marker is missing, go straight to the game
    if (!targetMarker) {
      onPick(continentId);
      return;
    }

    const targetRect = targetMarker.getBoundingClientRect();

    // Decide where the walk starts:
    // - first continent: from side-panel button
    // - next continents: from lastContinentId marker
    let sx: number;
    let sy: number;

    const h = window.innerHeight;
    const size = walkerSize;

    const startMarker =
      lastContinentId && markerRefs[lastContinentId]
        ? markerRefs[lastContinentId]
        : undefined;

    if (startMarker) {
      // Start from previous continent marker (center of the point)
      const prevRect = startMarker.getBoundingClientRect();
      sx = prevRect.left + prevRect.width / 2;
      sy = prevRect.top + prevRect.height / 2;
    } else {
      // First continent (no lastContinentId) – start from the selected side button
      const cardEl = cardRefs[continentId];
      if (!cardEl) {
        onPick(continentId);
        return;
      }
      const cardRect = cardEl.getBoundingClientRect();
      sx = cardRect.left + cardRect.width / 2;
      sy = cardRect.top + cardRect.height / 2;
    }

    // Target center (marker)
    const ex = targetRect.left + targetRect.width / 2;
    const ey = targetRect.top + targetRect.height / 2;

    // Start: feet at start position.
    walkerX = sx - size / 2; // center horizontally
    walkerY = h - sy; // bottom-aligned to the start point

    // Target: feet at the center of the map marker.
    restX = ex - size / 2;
    restY = h - ey;
    restFlip = ex < sx;

    // Movement vector from start feet to target feet
    const dx = ex - sx;
    const dy = ey - sy;

    walkerDx = `${dx}px`;
    walkerDy = `${dy}px`;
    walkerFlip = restFlip;

    // Duration of walk based on distance (slower walk)
    const dist = Math.hypot(dx, dy);
    walkerDuration = Math.min(4.0, Math.max(1.5, dist / 400));

    // Clear previous timers if any
    if (moveTimeout !== null) window.clearTimeout(moveTimeout);
    if (nextTimeout !== null) window.clearTimeout(nextTimeout);

    // Phase 1: walking animation
    walking = true;
    resting = false;

    // After one pass, stop walking and switch to standing pose
    moveTimeout = window.setTimeout(() => {
      walking = false;
      resting = true;
    }, walkerDuration * 1000);

    // Phase 2: after standing delay, call onPick and go to game screen
    nextTimeout = window.setTimeout(
      () => {
        resting = false;
        onPick(continentId);
      },
      walkerDuration * 1000 + EXTRA_DELAY_MS
    );
  }

  function handlePointClick(p: MapPoint) {
    startWalk(p.id);
  }

  function handleCardClick(continentId: string) {
    startWalk(continentId);
  }

  let isPaused = false;

  function togglePause() {
    isPaused = !isPaused;
  }

  onMount(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  $: if (isPaused) {
    // Pause menu logic
  }
</script>

<div class="mapselect-screen" class:disabled={isPaused}>
  <div class="topic-header" style="background: #ffffff">
    <span class="topic-name">{categoryName}</span>
  </div>
  <div class="map-layout">
    <!-- LEFT PANEL: continents 1–3 -->
    <aside class="side-panel left-panel" style="background: {categoryColor};">
      <div class="panel-inner">
        <h2 class="continents-title">Vyber kontinent</h2>
        <div class="continent-grid">
          {#each leftPoints as p}
            <button
              class="continent-card"
              use:cardRef={p.id}
              on:click={() => handleCardClick(p.id)}
            >
              <div class="continent-code">{p.order}</div>
              <div class="continent-text">
                <div class="continent-name">{p.name}</div>
                <div class="continent-sub">Spusti hru</div>
              </div>
            </button>
          {/each}
        </div>
      </div>
    </aside>

    <!-- MAP IN THE CENTER -->
    <main class="map-center">
      <div class="map-wrapper">
        <img
          bind:this={mapImg}
          src={`${base}img/mapa.png`}
          alt="Mapa sveta"
          class="map-image"
          on:load={handleMapLoad}
        />

        {#each points as p}
          <div
            class="map-marker"
            use:markerRef={p.id}
            style={`left:${p.x}%; top:${p.y}%;`}
          >
            {#if SHOW_DEBUG_POINTS}
              <button
                class="map-point"
                on:click={() => handlePointClick(p)}
                aria-label={`Bod ${p.order} - ${p.name}`}
                title={`Bod ${p.order} - ${p.name} (${p.pxX}×${p.pxY}px)`}
              ></button>
              <div class="map-label">
                Bod {p.order} - {p.name}
                <span class="coords">
                  {p.x.toFixed(2)}%, {p.y.toFixed(2)}%
                </span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </main>

    <!-- RIGHT PANEL: continents 4–6 -->
    <aside class="side-panel right-panel" style="background: {categoryColor};">
      <div class="panel-inner">
        <h2 class="continents-title">Vyber kontinent</h2>
        <div class="continent-grid">
          {#each rightPoints as p}
            <button
              class="continent-card"
              use:cardRef={p.id}
              on:click={() => handleCardClick(p.id)}
            >
              <div class="continent-code">{p.order}</div>
              <div class="continent-text">
                <div class="continent-name">{p.name}</div>
                <div class="continent-sub">Spusti hru</div>
              </div>
            </button>
          {/each}
        </div>
      </div>
    </aside>
  </div>
  <div class="back-button-container">
    <button class="back-button" on:click={onBack}>Späť</button>
  </div>
</div>

{#if walking}
  <!-- Phase 1: walking from start point (button or previous continent) to the target point -->
  <WalkFrames
    folder="anim/char"
    action="walk"
    frames={2}
    speed={8}
    size={walkerSize}
    x={walkerX}
    y={walkerY}
    flip={walkerFlip}
    across={true}
    dxRatio={null}
    dyRatio={null}
    dx={walkerDx}
    dy={walkerDy}
    duration={walkerDuration}
    bounce={false}
  />
{:else if resting}
  <!-- Phase 2: standing on the continent (static pose - player_stand.png) -->
  <WalkFrames
    folder="anim/char"
    action="stand"
    frames={1}
    speed={4}
    size={walkerSize}
    x={restX}
    y={restY}
    flip={restFlip}
    across={false}
    dxRatio={null}
    dyRatio={null}
    dx="0px"
    dy="0px"
    duration={1}
    bounce={false}
  />
{/if}

{#if isPaused}
  <PauseMenu 
    onResume={togglePause} 
    onSettings={() => {}}
    onMenu={() => {}}
  />
{/if}

<style>
  .mapselect-screen {
  background: #28caf0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

  .topic-header {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 16px;
    border: 2px solid var(--border);
    box-shadow: var(--shadow);
    z-index: 5;
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .topic-label {
    font-weight: 600;
    font-size: 1rem;
    color: rgba(0, 0, 0, 0.7);
  }

  .topic-name {
    font-weight: 700;
    font-size: 1.1rem;
    color: rgba(0, 0, 0, 0.7);
  }

.map-layout {
  display: flex;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;

  padding-top: 2.5vh;
  padding-bottom: 2.5vh;
  padding-left: 1vh;
  padding-right: 1vh;
}

  .side-panel {
    flex: 0 0 clamp(180px, 18vw, 260px);
    background: var(--surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    display: flex;
  }

  .map-center {
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .map-wrapper {
    position: relative;
    width: 90%;
    max-width: 1615px;
    background: var(--surface);
    border-radius: 0;
    overflow: hidden;
    box-shadow: none;
  }

  .map-image {
    display: block;
    width: 100%;
    height: auto;
  }

  .map-marker {
    position: absolute;
    width: 0;
    height: 0;
  }

  .map-point {
    position: absolute;
    left: 0;
    top: 0;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    border: none;
    padding: 0;
    background: var(--accent);
    box-shadow:
      0 0 0 2px rgba(255, 255, 255, 0.9),
      var(--shadow);
    cursor: pointer;
    transform: translate(-50%, -50%);
  }

  .map-point:hover {
    transform: translate(-50%, -50%) scale(1.1);
  }

  .map-label {
    position: absolute;
    left: 14px;
    top: 0;
    transform: translateY(-50%);
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.65);
    color: white;
    white-space: nowrap;
  }

  .coords {
    opacity: 0.8;
    margin-left: 4px;
  }

  .panel-inner {
    padding: 16px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .panel-inner h2 {
    margin: 0 0 8px;
    font-size: 0.95rem;
  }

  .continent-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .continent-card {
    display: grid;
    grid-template-columns: 52px 1fr;
    align-items: center;
    padding: 10px 12px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: var(--surface);
    box-shadow: var(--shadow);
    text-align: left;
    cursor: pointer;
  }

  .continent-card:hover {
    filter: brightness(1.03);
  }

  .continent-code {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    font-weight: 800;
    background: #f1f5f9;
    border: 1px solid var(--border);
  }

  .continent-text {
    padding-left: 10px;
  }

  .continent-name {
    font-size: 0.9rem;
    font-weight: 600;
  }

  .continent-sub {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  @media (max-width: 1024px) {
    .map-layout {
      flex-direction: column;
    }

    .side-panel {
      flex-basis: auto;
      min-height: 80px;
    }

    .panel-inner {
      flex-direction: row;
      overflow-x: auto;
    }

    .continent-grid {
      flex-direction: row;
    }

    .continent-card {
      min-width: 160px;
    }
  }

  .mapselect-screen.disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  .back-button-container {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
  }

  .back-button {
    padding: 10px 20px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
    cursor: pointer;
    box-shadow: var(--shadow);
    font-weight: 600;
  }

  .back-button:hover {
    background: #f3f4f6;
  }

  .continents-title{
    font-size: 24px !important;
    color: white;
    font-weight: 800;
    -webkit-text-stroke: 1px black;
    text-shadow:
       3px 3px 0 #000,
     -1px -1px 0 #000,  
      1px -1px 0 #000,
      -1px 1px 0 #000,
       1px 1px 0 #000;
  }
</style>
