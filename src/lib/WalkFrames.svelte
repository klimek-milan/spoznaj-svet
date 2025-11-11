<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    const base = import.meta.env.BASE_URL;
  
    // ZDROJE
    export let folder = "anim/char";
    export let action = "walk";
    export let frames = 2;
    export let speed = 8;
    export let size = 140;
    export let x = 24;   // offset zľava (px)
    export let y = 24;   // offset od spodku (px)
    export let flip = false;
  
    // POHYB
    export let across = false;
    /** POMEROVÉ nastavenie: -1..1 (kladné = doprava/dole, záporné = doľava/hore) */
    export let dxRatio: number | null = null;  // napr. 0.4
    export let dyRatio: number | null = null;  // napr. -0.2
  
    /** Fallback – ak nechceš ratio, môžeš ponechať pôvodné stringy */
    export let dx: string = "40vw";
    export let dy: string = "0";
  
    export let duration = 12;
    export let bounce = true;
  
    let idx = 1;
    let timer: number | undefined;
  
    // vypočítané px pre pohyb (ako CSS premenné)
    let dxPx = 0;
    let dyPx = 0;
  
    // dynamická cesta k snímke
    $: src = `${base}${folder}/player_${action}${frames > 1 ? idx : ""}.png`;
  
    function tick() { idx = (idx % frames) + 1; }
  
    function recalc() {
      // dostupný priestor vpravo/ľavo
      const w = window.innerWidth;
      const h = window.innerHeight;
  
      // doprava: koľko max môžeme ísť, aby pravý okraj nevyšiel von
      const availRight = Math.max(0, w - (x + size));
      // doľava: koľko max môžeme ísť, aby ľavý okraj nešiel pod 0
      const availLeft  = Math.max(0, x);
  
      // hore: od spodného ukotvenia vieme ísť max po horný okraj
      const availUp    = Math.max(0, h - (y + size));
      // dole: k spodku – môžeme ísť len po spodok (t. j. zmenšovať bottom), max je y
      const availDown  = Math.max(0, y);
  
      if (dxRatio !== null) {
        dxPx = dxRatio >= 0
          ? Math.round(availRight * Math.min(dxRatio, 1))
          : -Math.round(availLeft  * Math.min(-dxRatio, 1));
      }
  
      if (dyRatio !== null) {
        dyPx = dyRatio >= 0
          ? Math.round(availDown  * Math.min(dyRatio, 1))      // dole
          : -Math.round(availUp   * Math.min(-dyRatio, 1));    // hore (negatívne)
      }
    }
  
    function onResize() { recalc(); }
  
    onMount(() => {
      if (frames > 1) timer = window.setInterval(tick, 1000 / speed);
      // prvý prepočet + listenery
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
      width: 100%; height: 100%; object-fit: contain;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,.25));
    }
    .walker img.flip{ transform: scaleX(-1); }
  
    /* tam/späť */
    .move{ animation: moveDiag var(--duration) linear infinite; }
    @keyframes moveDiag{
      0%   { transform: translate(0,0) scaleX(1); }
      45%  { transform: translate(var(--dx), var(--dy)) scaleX(1); }
      50%  { transform: translate(var(--dx), var(--dy)) scaleX(-1); }
      95%  { transform: translate(0,0) scaleX(-1); }
      100% { transform: translate(0,0) scaleX(1); }
    }
  
    /* jedným smerom stále dookola */
    .moveOne{ animation: moveDiagOne var(--duration) linear infinite; }
    @keyframes moveDiagOne{
      0%   { transform: translate(0,0); }
      100% { transform: translate(var(--dx), var(--dy)); }
    }
  
    /* bezpečnostná poistka: na veľmi úzkych obrazovkách pohyb vypneme */
    @media (max-width: 420px){
      .move, .moveOne { animation: none; }
    }
  
    /* rešpektuj prístupnosť */
    @media (prefers-reduced-motion: reduce){
      .move, .moveOne { animation: none; }
    }
  </style>