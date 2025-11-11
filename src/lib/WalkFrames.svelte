<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    const base = import.meta.env.BASE_URL;
  
    // Verejné vlastnosti
    export let folder = "anim/char";  // cesta pod public/
    export let action = "walk";       // "walk" | "idle" | "cheer" | "swim" | ...
    export let frames = 2;            // koľko PNG pre danú akciu (walk=2, cheer=2, idle=1…)
    export let speed = 8;             // FPS (snímky za sekundu)
    export let size = 140;            // veľkosť v px
    export let x = 24;                // pozícia od ľavého okraja
    export let y = 24;                // pozícia od spodného okraja
    export let flip = false;          // zrkadlenie horizontálne (doľava/doprava)
    export let across = false;        // nech si „prejde“ obrazovku a späť
  
    let idx = 1;
    let timer: number | undefined;
  
    // cesta k aktuálnej snímke
    $: src = `${base}${folder}/player_${action}${frames > 1 ? idx : ""}.png`;
  
    function tick() {
      idx = (idx % frames) + 1;
    }
  
    onMount(() => {
      if (frames > 1) timer = window.setInterval(tick, 1000 / speed);
    });
    onDestroy(() => { if (timer) clearInterval(timer); });
  </script>
  
  <div class="walker {across ? 'move' : ''}" style={`left:${x}px; bottom:${y}px; width:${size}px; height:${size}px;`}>
    <img class:flip src={src} alt={action} draggable="false" />
  </div>
  
  <style>
    .walker{
      position: fixed;                /* pripni do rohu, nech neovplyvňuje layout */
      pointer-events: none;
      z-index: 40;
    }
    .walker img{
      width: 100%; height: 100%; object-fit: contain;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,.25));
    }
    .walker img.flip{ transform: scaleX(-1); }
  
    /* voliteľný presun cez obrazovku a späť */
    .move{
      animation: across 12s linear infinite;
    }
    @keyframes across{
      0%   { transform: translateX(0); }
      45%  { transform: translateX(40vw); }
      50%  { transform: translateX(40vw) scaleX(-1); }
      95%  { transform: translateX(0)     scaleX(-1); }
      100% { transform: translateX(0); }
    }
  </style>
  