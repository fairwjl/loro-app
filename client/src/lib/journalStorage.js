// client/src/lib/journalStorage.js

const STORAGE_KEY = "journalHistory";

function safeParse(json) {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** Return an array of entries: [{ id:number, content:string, createdAt?:number }] */
export function loadJournalHistory() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return safeParse(raw);
}

/** Append a single entry object to storage */
export function saveJournalEntry(entry) {
  if (!entry || typeof entry !== "object") return;
  const list = loadJournalHistory();
  const withDefaults = {
    id: entry.id ?? Date.now(),
    content: String(entry.content ?? "").trim(),
    createdAt: entry.createdAt ?? Date.now(),
  };
  if (!withDefaults.content) return;
  list.push(withDefaults);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Clear all journal history */
export function clearJournalHistory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}