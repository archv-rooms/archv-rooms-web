import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environments';

export interface SaveSlot {
  slot: number;
  saveData: any;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class SaveService {
  private http = inject(HttpClient);
  private dbName = 'archv-saves';
  private storeName = 'saves';

  // ─── IndexedDB ───────────────────────────────────────────

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private localKey(gameId: number, slot: number): string {
    return `game_${gameId}_slot_${slot}`;
  }

  async saveLocal(gameId: number, slot: number, saveData: any): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).put({
        key: this.localKey(gameId, slot),
        saveData,
        updatedAt: new Date().toISOString()
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async loadLocal(gameId: number, slot: number): Promise<any | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const req = tx.objectStore(this.storeName).get(this.localKey(gameId, slot));
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  async loadAllLocal(gameId: number): Promise<SaveSlot[]> {
    const slots: SaveSlot[] = [];
    for (let slot = 1; slot <= 3; slot++) {
      const data = await this.loadLocal(gameId, slot);
      if (data) slots.push({ slot, saveData: data.saveData, updatedAt: data.updatedAt });
    }
    return slots;
  }

  // ─── API (nuvem) ─────────────────────────────────────────

  private headers(): HttpHeaders {
    const token = localStorage.getItem('@archv:token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  syncToCloud(gameId: number, slot: number, saveData: any): void {
    const token = localStorage.getItem('@archv:token');
    if (!token) return;

    this.http.post(
      `${environment.apiUrl}/saves/${gameId}`,
      { slot, saveData },
      { headers: this.headers() }
    ).subscribe({ error: (e) => console.warn('[save] sync falhou:', e) });
  }

  loadFromCloud(gameId: number): Promise<SaveSlot[]> {
    const token = localStorage.getItem('@archv:token');
    if (!token) return Promise.resolve([]);

    return new Promise((resolve) => {
      this.http.get<{ success: boolean; data: SaveSlot[] }>(
        `${environment.apiUrl}/saves/${gameId}`,
        { headers: this.headers() }
      ).subscribe({
        next: (res) => resolve(res.success ? res.data : []),
        error: () => resolve([])
      });
    });
  }

  // ─── Salvar + sincronizar ─────────────────────────────────

  async save(gameId: number, slot: number, saveData: any): Promise<void> {
    await this.saveLocal(gameId, slot, saveData);
    this.syncToCloud(gameId, slot, saveData);
  }
}