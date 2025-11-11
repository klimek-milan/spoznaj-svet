import { writable } from "svelte/store";

export type Settings = {
  sound: boolean;
  timer: boolean;
  seconds: number;
};
export const settings = writable<Settings>({
  sound: true,
  timer: false,
  seconds: 20
});