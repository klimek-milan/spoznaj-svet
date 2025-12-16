<script lang="ts">
  import { onMount } from "svelte";

  let audio: HTMLAudioElement | null;
  let isPlaying = false;

  function startMusic() {
    if (!audio) {
      audio = new Audio("/ambient.mp3");
      audio.loop = true;
    }
    audio.play();
    isPlaying = true;
  }

  onMount(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio = null;
      }
    };
  });
</script>

{#if !isPlaying}
  <button on:click={startMusic} class="start-music">Start Music</button>
{/if}

<style>
  .start-music {
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 10px 20px;
    background-color: #2b6deb;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  }
</style>