<script lang="ts">
    export let onStart = () => {};
    export let onHelp = () => {};
    export let onThanks = () => {};
  </script>
  
  <div class="wrap">
    <button class="btn" on:click={onStart}>SPUSTIŤ HRU</button>
    <button class="btn" on:click={onHelp}>NÁVOD</button>
    <button class="btn" on:click={onThanks}>POĎAKOVANIE</button>
  </div>
  
  <style>
    .wrap{
      min-height: 100dvh;
      display: grid;
      place-items: center;
      background: #f0f2f7;
      padding: 24px;
    }
    .wrap::before{
      content:"";
      position:fixed; inset:0;
      background:
        radial-gradient(transparent 0 12px,#0001 13px) 0 0/28px 28px;
      opacity:.06; pointer-events:none;
    }
    .btn{
      width:min(720px, 92vw);
      height:90px;
      margin:18px 0;
      border:6px solid #000;
      border-radius:8px;
      background:#fff;
      box-shadow: 0 8px 0 #0005; /* jemný „odtieň“ ako na obrázku */
      font: 800 42px/1.1 system-ui, "Segoe UI", Roboto, Arial, sans-serif;
      letter-spacing: .5px;
      text-transform: uppercase;
      cursor: pointer;
      transition: transform .05s ease, box-shadow .05s ease, filter .15s;
    }
    .btn:hover{ filter:brightness(0.98); }
    .btn:active{
      transform: translateY(2px);
      box-shadow: 0 6px 0 #0004;
    }
  </style>
  