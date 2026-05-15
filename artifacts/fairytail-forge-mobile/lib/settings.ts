import AsyncStorage from "@react-native-async-storage/async-storage";

const DEMO_KEY = "ff.offlineDemo.v1";

let cached: boolean | null = null;
const listeners = new Set<(value: boolean) => void>();

export async function loadDemoMode(): Promise<boolean> {
  if (cached !== null) return cached;
  try {
    const raw = await AsyncStorage.getItem(DEMO_KEY);
    cached = raw === "1";
  } catch {
    cached = false;
  }
  return cached;
}

export function getDemoModeSync(): boolean {
  return cached ?? false;
}

export async function setDemoMode(value: boolean): Promise<void> {
  cached = value;
  try {
    await AsyncStorage.setItem(DEMO_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
  listeners.forEach((fn) => fn(value));
}

export function subscribeDemoMode(fn: (value: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
