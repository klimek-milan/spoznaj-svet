<script lang="ts">
    import { settings } from "../stores/settings";
    import { get } from "svelte/store";
    export let onBack = () => {};
    let s = get(settings);
    function save(){ settings.set(s); onBack(); }
  </script>
  
  <section class="page">
    <h1>Nastavenia</h1>
  
    <label class="row">
      <input type="checkbox" bind:checked={s.music} />
      Zapnúť hudbu
    </label>
  
    <label class="row">
      <span>Hlasitosť: {s.volume}%</span>
      <input class="slider" type="range" min="0" max="100" step="1" bind:value={s.volume} disabled={!s.music} />
    </label>
  
    <label class="row">
      <input type="checkbox" bind:checked={s.sound} />
      Zvuk správne/nesprávne
    </label>
  
    <label class="row">
      <span>Hlasitosť zvukov: {s.soundVolume}%</span>
      <input class="slider" type="range" min="0" max="100" step="1" bind:value={s.soundVolume} disabled={!s.sound} />
    </label>
  
    <label class="row">
      <input type="checkbox" bind:checked={s.timer} />
      Časovač na otázku
    </label>
  
    <label class="row">
      <span>Čas (s):</span>
      <input class="num" type="number" min="5" max="120" step="5" bind:value={s.seconds} />
    </label>
  
    <div class="actions">
      <button on:click={onBack}>Zrušiť</button>
      <button on:click={save}>Uložiť</button>
    </div>
  </section>
  
  <style>
  .page{max-width:680px;margin:40px auto;padding:18px;background:var(--surface);
        border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow);color:#000}
  .row{display:flex;gap:12px;align-items:center;margin:12px 0}
  .num{width:100px;padding:8px;border:1px solid var(--border);border-radius:10px}
  .slider{flex:1;min-width:200px}
  .actions{display:flex;gap:12px;justify-content:flex-end;margin-top:12px}
  button{padding:10px 14px;border:1px solid var(--border);border-radius:12px;background:var(--surface)}
  </style>
  