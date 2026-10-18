import { useEffect, useSyncExternalStore } from "react";
import * as repo from "./settingsRepo";

export type { Settings, Neighborhood, SettingsPatch, NeighborhoodInput } from "./settingsRepo";

let state: repo.Settings = repo.DEFAULT_SETTINGS;
let loaded = false;
const subs = new Set<() => void>();

const set = (s: repo.Settings) => {
  state = s;
  subs.forEach((f) => f());
};
const subscribe = (f: () => void) => {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
};
const refresh = async () => set(await repo.getSettings());

export async function loadSettings() {
  if (loaded) return;
  loaded = true;
  await refresh();
}

export const saveSettings = async (p: repo.SettingsPatch) => { await repo.updateSettings(p); await refresh(); };
export const addNeighborhood = async (i: repo.NeighborhoodInput) => { await repo.createNeighborhood(i); await refresh(); };
export const editNeighborhood = async (id: number, p: Partial<repo.NeighborhoodInput>) => { await repo.updateNeighborhood(id, p); await refresh(); };
export const removeNeighborhood = async (id: number) => { await repo.deleteNeighborhood(id); await refresh(); };

export function useSettings(): repo.Settings {
  const s = useSyncExternalStore(subscribe, () => state, () => repo.DEFAULT_SETTINGS);
  useEffect(() => {
    void loadSettings();
  }, []);
  return s;
}
