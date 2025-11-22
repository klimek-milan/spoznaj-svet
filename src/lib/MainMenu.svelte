<script lang="ts">
    const base = import.meta.env.BASE_URL;
    export let onStart: () => void = () => {};
    export let onHowTo: () => void = () => {};
    export let onSettings: () => void = () => {};
    export let onCredits: () => void = () => {};
  </script>
  
  <section class="menu">
    <div class="left">
      <h1 class="title">Spoznaj svet</h1>
  
      <button class="pill" on:click={onHowTo}>
        <span>Návod</span>
      </button>
  
      <button class="pill primary" on:click={onStart}>
        <span>Spusti hru</span>
      </button>
  
      <button class="pill" on:click={onSettings}>
        <span>Nastavenie</span>
      </button>
  
      <button class="pill" on:click={onCredits}>
        <span>Credentials</span>
      </button>
    </div>
  
  </section>
  
  <style>
    .menu {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: calc(100dvh - 64px); /* pod navigačkou */
      padding: 24px;
      position: relative;
      z-index: 100;
    }

    .left {
      display: flex;
      flex-direction: column;
      gap: 18px;
      align-items: stretch;
      min-width: 320px;
      max-width: 440px;
      width: 100%;
    }
    .title {
      margin: 0 0 6px 0;
      font-size: 56px;
      line-height: 1.05;
      text-align: center;
    }
  
  .pill{
    text-align: center;
    padding:18px 22px;
    border-radius:999px;
    border:2px solid var(--border);
    background:linear-gradient(180deg,#fff, #F6F7FB);
    box-shadow: 0 8px 24px rgba(15,23,42,.08);
    font-size:24px;
    font-weight:700;
    cursor:pointer;
    transition: transform .06s ease, box-shadow .12s ease, border-color .15s ease;
    width: 100%;
    box-sizing: border-box;
    display: block;
  }
  .pill:hover{ transform:translateY(-2px); box-shadow:0 14px 30px rgba(15,23,42,.12); }
  .pill.primary{ border-color:#2B6DEB; background:linear-gradient(180deg,#fff,#EFF6FF); }
  .pill:focus-visible{ outline:4px auto #93C5FD; }
  
  .hero{
    display:grid; place-items:center;
    padding:12px;
  }
  .hero img{
    width:min(930px, 70vw);
    height:auto;
    border-radius:22px;
    box-shadow: 0 20px 40px rgba(15,23,42,.12);
    background:#fff;
  }
  @media (max-width: 980px){
    .title{ font-size:44px; }
    .hero img{ width: min(680px, 92vw); }
  }
  </style>