import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecentSearchItem {
  id: string;
  pickup: string;
  destination: string;
  timestamp: number;
}

const STORAGE_PREFIX = '@gotogether_recent_searches_';

export async function getRecentSearches(userId?: string | null): Promise<RecentSearchItem[]> {
  try {
    const key = `${STORAGE_PREFIX}${userId || 'guest'}`;
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const items: RecentSearchItem[] = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function saveRecentSearch(userId: string | null | undefined, pickup: string, destination: string): Promise<RecentSearchItem[]> {
  const cleanPickup = pickup.trim();
  const cleanDest = destination.trim();
  if (!cleanPickup || !cleanDest) return getRecentSearches(userId);

  try {
    const key = `${STORAGE_PREFIX}${userId || 'guest'}`;
    const existing = await getRecentSearches(userId);
    
    // Deduplicate identical FROM -> TO searches
    const filtered = existing.filter(
      item => !(item.pickup.toLowerCase() === cleanPickup.toLowerCase() && item.destination.toLowerCase() === cleanDest.toLowerCase())
    );

    const newItem: RecentSearchItem = {
      id: `search_${Date.now()}`,
      pickup: cleanPickup,
      destination: cleanDest,
      timestamp: Date.now(),
    };

    const updated = [newItem, ...filtered].slice(0, 8); // Max 8 recent searches
    await AsyncStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export async function clearRecentSearches(userId?: string | null): Promise<void> {
  try {
    const key = `${STORAGE_PREFIX}${userId || 'guest'}`;
    await AsyncStorage.removeItem(key);
  } catch {
    // Silently ignore storage errors
  }
}
