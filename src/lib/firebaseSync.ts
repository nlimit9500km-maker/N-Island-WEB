import { collection, doc, getDocs, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

// Keys we want to sync
const SYNC_KEYS = [
  "island_entries", 
  "life_diary_entries", 
  "island_letters", 
  "island_anniversaries",
  "island_theme",
  "island_profile",
  "island_pin",
  "island_lock_enabled",
  "island_locked_state",
  "island_quiet_hour",
  "island_quiet_min",
  "island_quiet_enabled",
  "future_letter_draft",
  "dia_drafts",
  "shared_drafts_pool"
];

let isInitialized = false;

// In-memory storage to bypass 5MB browser quota
const memoryStorage = new Map<string, string>();

// Track which keys are currently stored as chunked documents to clean them up properly
const knownChunkedKeys = new Set<string>();

// Maximum characters per chunk (~900KB to stay safely under 1MB Firestore limit)
const CHUNK_SIZE = 900000;

export async function initFirebaseSync() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    console.log("Fetching data from Firebase...");

    // Race the fetch call against a 2.5-second timeout to avoid locking the screen if connection is blocked
    const fetchPromise = getDocs(collection(db, "island_state"));
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Firestore connection timeout")), 2500)
    );

    const stateSnap = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Process chunks and standard documents
    const groupedChunks: Record<string, string[]> = {};
    const standardDocs: Record<string, string> = {};

    stateSnap.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;
      
      if (id.includes("_chunk_")) {
        const [baseKey, chunkIndex] = id.split("_chunk_");
        if (!groupedChunks[baseKey]) groupedChunks[baseKey] = [];
        groupedChunks[baseKey][parseInt(chunkIndex)] = data.value;
      } else {
        if (data.isChunked) {
          knownChunkedKeys.add(id);
        } else if (data.value !== undefined) {
          standardDocs[id] = data.value;
        }
      }
    });

    // Load standard non-chunked docs into memory
    for (const [key, value] of Object.entries(standardDocs)) {
      memoryStorage.set(key, value);
      try { localStorage.setItem(key, value); } catch (e) {}
    }

    // Assemble chunked docs into memory
    for (const [key, chunks] of Object.entries(groupedChunks)) {
      const assembledValue = chunks.join('');
      memoryStorage.set(key, assembledValue);
      try { localStorage.setItem(key, assembledValue); } catch (e) {}
    }

    console.log("Firebase sync initialization complete.");

  } catch (err) {
    console.warn("Firebase fetch timed out or failed. Running in offline/local fallback mode.", err);
  }

  // Intercept localStorage methods
  const originalSetItem = window.localStorage.setItem.bind(window.localStorage);
  const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
  const originalRemoveItem = window.localStorage.removeItem.bind(window.localStorage);

  window.localStorage.getItem = function (key: string) {
    if (memoryStorage.has(key)) return memoryStorage.get(key) || null;
    return originalGetItem(key);
  };

  window.localStorage.setItem = function (key: string, value: string) {
    memoryStorage.set(key, value);
    try {
      originalSetItem(key, value);
    } catch (e) {
      console.warn(`Local storage quota exceeded for ${key}, but safely stored in memory & cloud.`);
    }
    if (SYNC_KEYS.includes(key) || key.startsWith('icity_') || key.startsWith('island_')) {
       syncToFirebase(key, value);
    }
  };

  window.localStorage.removeItem = function (key: string) {
    memoryStorage.delete(key);
    originalRemoveItem(key);
    if (SYNC_KEYS.includes(key) || key.startsWith('icity_') || key.startsWith('island_')) {
       deleteFromFirebase(key);
    }
  };
}

// Simple debounce map
const timeouts: Record<string, any> = {};

function syncToFirebase(key: string, value: string) {
  if (timeouts[key]) clearTimeout(timeouts[key]);
  timeouts[key] = setTimeout(async () => {
    try {
      if (value.length > CHUNK_SIZE) {
        // Chunking
        const totalChunks = Math.ceil(value.length / CHUNK_SIZE);
        const batch = writeBatch(db);
        
        // Write header marker
        const headerRef = doc(db, "island_state", key);
        batch.set(headerRef, { isChunked: true, chunks: totalChunks, updatedAt: new Date().toISOString() });
        
        // Write segments
        for (let i = 0; i < totalChunks; i++) {
          const chunkStr = value.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          const chunkRef = doc(db, "island_state", `${key}_chunk_${i}`);
          batch.set(chunkRef, { value: chunkStr, index: i });
        }
        
        await batch.commit();
        knownChunkedKeys.add(key);
        console.log(`Synced ${key} in ${totalChunks} chunks.`);
      } else {
         // Cleanup any potential old chunks if resizing down
         if (knownChunkedKeys.has(key)) {
             const batch = writeBatch(db);
             // Safely delete up to 20 potential chunk indices to be absolutely clean
             for(let i=0; i < 20; i++) {
                 batch.delete(doc(db, "island_state", `${key}_chunk_${i}`));
             }
             batch.set(doc(db, "island_state", key), { value, updatedAt: new Date().toISOString() });
             await batch.commit();
             knownChunkedKeys.delete(key);
         } else {
             const docRef = doc(db, "island_state", key);
             await setDoc(docRef, { value, updatedAt: new Date().toISOString() });
         }
      }
    } catch (e) {
      console.error(`Failed to sync ${key} to Firebase`, e);
    }
  }, 1500);
}

function deleteFromFirebase(key: string) {
  if (timeouts[key]) clearTimeout(timeouts[key]);
  timeouts[key] = setTimeout(async () => {
    try {
      if (knownChunkedKeys.has(key)) {
          const batch = writeBatch(db);
          for(let i=0; i < 20; i++) {
              batch.delete(doc(db, "island_state", `${key}_chunk_${i}`));
          }
          batch.delete(doc(db, "island_state", key));
          await batch.commit();
          knownChunkedKeys.delete(key);
      } else {
          const docRef = doc(db, "island_state", key);
          await deleteDoc(docRef);
      }
    } catch (e) {
      console.error(`Failed to delete ${key} from Firebase`, e);
    }
  }, 1000);
}
