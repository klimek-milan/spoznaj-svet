<script lang="ts">
  const base = import.meta.env.BASE_URL; // napr. "/spoznaj-svet/" alebo "./"
  let src = base + "media/intro1.mp4";
  let showQ = false, score = 0;
  const answers = [
    { t:"CMYK", ok:false }, { t:"RGB", ok:true },
    { t:"Pantone", ok:false }, { t:"LAB", ok:false }
  ];
  function onEnded(){ showQ = true; }
  function pick(a:{t:string;ok:boolean}){ if(a.ok) score++; showQ=false; }
</script>

<main style="max-width:900px;margin:0 auto;padding:16px;font-family:system-ui">
  <h1>Spoznaj svet</h1>
  <video src={src} playsinline muted preload="metadata" on:ended={onEnded} controls
         style="width:100%;border-radius:12px;background:#000"></video>
  {#if showQ}
    <h2>Ktorý model je pre displeje?</h2>
    {#each answers as a}
      <button on:click={() => pick(a)} style="display:block;width:100%;padding:12px;margin:8px 0;border-radius:10px;border:1px solid #334;background:#18213f;color:#eef;text-align:left">
        {a.t}
      </button>
    {/each}
  {/if}
  <p>Skóre: {score}</p>
</main>
