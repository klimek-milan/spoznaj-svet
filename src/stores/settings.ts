import { writable } from "svelte/store";

export type Settings = {
  sound: boolean;
  timer: boolean;
  seconds: number;
  volume: number;
  music: boolean;
};
export const settings = writable<Settings>({
  sound: true,
  timer: false,
  seconds: 20,
  volume: 50,
  music: true
});