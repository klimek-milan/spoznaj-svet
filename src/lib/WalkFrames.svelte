<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  const base = import.meta.env.BASE_URL;

  // Character walk animation component
  // Sprint task: "coding – pohyb postavičky" (character movement)
  // Implemented by: Milan Klimek, November 2025
  // NOTE: This component handles continuous/basic movement only.
  //       Path/waypoint-based movement will be handled separately.

  // SPRITE SOURCES
  export let folder = "anim/char";
  export let action = "walk";
  export let frames = 2;
  export let speed = 8;
  export let size = 140;
  export let x = 24;   // horizontal offset from the left (px)
  export let y = 24;   // vertical offset from the bottom (px)
  export let flip = false;

  // MOVEMENT FLAGS
  export let across = false;

  /**
   * Relative movement ratio in range -1..1
   * Positive = move right/down, negative = move left/up.
   * This is converted to pixel values based on available screen space.
   */
  export let dxRatio: number | null = null;  // e.g. 0.4
  export let dyRatio: number | null = null;  // e.g. -0.2

  /**
   * Fallback: if you don't want to use ratios,
   * you can keep original CSS string values (vw/px/...).
   */
  export let dx: string = "40vw";
  export let dy: string = "0";

  export let duration = 12;
  export let bounce = true;

  let idx = 1;
  let timer: number | undefined;

  // Computed pixel offsets for movement (used as CSS variables)
  let dxPx = 0;
  let dyPx = 0;

  // Dynamic path to sprite frame
  $: src = `${base}${folder}/player_${action}${frames > 1 ? idx : ""}.png`;

  function tick() {
    idx = (idx % frames) + 1;
  }

  function recalc() {
    // Available screen size
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Horizontal limits:
    // right: max distance so the right edge doesn't leave the viewport
    const availRight = Math.max(0, w - (x + size));
    // left: max distance so the left edge doesn't go below 0
    const availLeft  = Math.max(0, x);

    // Vertical limits (relative to bottom anchoring):
    // up: how far we can go towards the top without clipping
    const availUp    = Math.max(0, h - (y + size));
    // down: how far we can move towards the bottom (reducing "bottom")
    const availDown  = Math.max(0, y);

    if (dxRatio !== null) {
      dxPx = dxRatio >= 0
        ? Math.round(availRight * Math.min(dxRatio, 1))
        : -Math.round(availLeft  * Math.min(-dxRatio, 1));
    }

    if (dyRatio !== null) {
      dyPx = dyRatio >= 0
        ? Math.round(availDown  * Math.min(dyRatio, 1))      // move down
        : -Math.round(availUp   * Math.min(-dyRatio, 1));    // move up (negative)
    }
  }

  function onResize() {
    recalc();
  }

  onMount(() => {
    if (frames > 1) timer = window.setInterval(tick, 1000 / speed);
    // Initial calculation + event listeners
    recalc();
    window.addEventListener("resize", onResize);
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
    window.removeEventListener("resize", onResize);
  });
</script>

<div
  class="walker {across ? (bounce ? 'move' : 'moveOne') : ''}"
  style={`
    left:${x}px; bottom:${y}px; width:${size}px; height:${size}px;
    --dx:${dxRatio !== null ? dxPx + 'px' : dx};
    --dy:${dyRatio !== null ? dyPx + 'px' : dy};
    --duration:${duration}s;
  `}
>
  <img class:flip src={src} alt={action} draggable="false" />
</div>

<style>
  .walker{
    position: fixed;
    pointer-events: none;
    z-index: 40;
  }
  .walker img{
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 8px 16px rgba(0,0,0,.25));
  }
  .walker img.flip{
    transform: scaleX(-1);
  }

  /* Back-and-forth diagonal movement */
  .move{
    animation: moveDiag var(--duration) linear infinite;
  }
  @keyframes moveDiag{
    0%   { transform: translate(0,0) scaleX(1); }
    45%  { transform: translate(var(--dx), var(--dy)) scaleX(1); }
    50%  { transform: translate(var(--dx), var(--dy)) scaleX(-1); }
    95%  { transform: translate(0,0) scaleX(-1); }
    100% { transform: translate(0,0) scaleX(1); }
  }

  /* One-way looping movement in a single direction */
  .moveOne{
    animation: moveDiagOne var(--duration) linear infinite;
  }
  @keyframes moveDiagOne{
    0%   { transform: translate(0,0); }
    100% { transform: translate(var(--dx), var(--dy)); }
  }

  /* Safety: disable animation on very narrow screens */
  @media (max-width: 420px){
    .move,
    .moveOne {
      animation: none;
    }
  }

  /* Respect accessibility preferences (reduced motion) */
  @media (prefers-reduced-motion: reduce){
    .move,
    .moveOne {
      animation: none;
    }
  }
</style>
