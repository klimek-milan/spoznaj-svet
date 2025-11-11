<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    const base = import.meta.env.BASE_URL;
  
    // ZDROJE
    export let folder = "anim/char";   // cesta pod public/
    export let action = "walk";        // "walk" | "cheer" | ...
    export let frames = 2;             // počet PNG snímok danej akcie (walk2 => 2)
    export let speed = 8;              // FPS
    export let size = 140;             // veľkosť v px
    export let x = 24;                 // offset zľava (px)
    export let y = 24;                 // offset od spodku (px)
    export let flip = false;           // zrkadlenie obrázka (doľava)
  
    // POHYB
    export let across = false;         // zapnúť pohyb
    export let dx: string = "40vw";    // horizontálny posun (môže byť "px", "vw")
    export let dy: string = "0";       // vertikálny posun (napr. "-20vh", "120px")
    export let duration = 12;          // trvanie jednej cesty v sekundách
    export let bounce = true;          // odraziť sa naspäť (tam/späť), inak cyklus jedným smerom
  
    let idx = 1;
    let timer: number | undefined;
  
    // dynamická cesta k snímke
    $: src = `${base}${folder}/player_${action}${frames > 1 ? idx : ""}.png`;
  
    function tick() { idx = (idx % frames) + 1; }
  
    onMount(() => { if (frames > 1) timer = window.setInterval(tick, 1000 / speed); });
    onDestroy(() => { if (timer) clearInterval(timer); });
  </script>
  
  <div
    class="walker {across ? (bounce ? 'move' : 'moveOne') : ''}"
    style={`
      left:${x}px; bottom:${y}px; width:${size}px; height:${size}px;
      --w:${size}px; --h:${size}px; --frames:${frames}; --dur:${frames/speed}s;
      --dx:${dx}; --dy:${dy}; --duration:${duration}s;
    `}
  >
    <img class:flip src={src} alt={action} draggable="false" />
  </div>
  
  <style>
    .walker{
      position: fixed;
      pointer-events: none;
      z-index: 40;
      /* animácia krokov zo sprites (prepínanie pozadia nerobíme, lebo máš samostatné PNG snímky) */
      /* krokovanie riešime JS intervalom (idx) – žiadny CSS sprite-sheet netreba */
    }
    .walker img{
      width: 100%; height: 100%; object-fit: contain;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,.25));
      transition: transform .2s;
    }
    .walker img.flip{ transform: scaleX(-1); }
  
    /* DIAGONÁLNY POHYB – tam a späť s otočením v strede */
    .move{
      animation: moveDiag var(--duration) linear infinite;
    }
    @keyframes moveDiag{
      0%   { transform: translate(0,0) scaleX(1); }
      45%  { transform: translate(var(--dx), var(--dy)) scaleX(1); }
      50%  { transform: translate(var(--dx), var(--dy)) scaleX(-1); } /* otoč v polovici */
      95%  { transform: translate(0,0) scaleX(-1); }
      100% { transform: translate(0,0) scaleX(1); }
    }
  
    /* DIAGONÁLNY POHYB – stále jedným smerom (bez návratu) */
    .moveOne{
      animation: moveDiagOne var(--duration) linear infinite;
    }
    @keyframes moveDiagOne{
      0%   { transform: translate(0,0); }
      100% { transform: translate(var(--dx), var(--dy)); }
    }
  </style>
  