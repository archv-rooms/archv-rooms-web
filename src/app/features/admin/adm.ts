//      INTEGRAÇÃO BACKEND 
// Todas as chamadas de API estão centralizadas na classe `Api` abaixo.
// Para conectar ao seu backend, edite apenas a const BASE_URL e
// os métodos correspondentes. Cada método tem comentários indicando
// o endpoint REST esperado.
// ═══════════════════════════════════════════════════════

// ── CONFIG ────────────────────────────────────────────
// BACKEND LINK: troque pela URL base do seu backend
const BASE_URL = "https://api.archvrooms.com.br";

// BACKEND LINK: token de autenticação — ajuste conforme sua estratégia
// (localStorage, cookie, env, etc.)
function getAuthToken(): string {
  return localStorage.getItem("adm_token") ?? "";
}

// ── TIPOS ─────────────────────────────────────────────
interface Game {
  id: string;
  title: string;
  platform: "arcade" | "console" | "handheld";
  year: number;
  developer: string;
  downloadLink: string;
  coverUrl: string;
  description: string;
  sizeMb: number;
  downloads: number;
  status: "active" | "hidden";
}

interface User {
  id: string;
  username: string;
  email: string;
  lastLogin: string; // ISO date
  dailyDownloads: number;
  isSubscriber: boolean;
  status: "active" | "banned";
  banUntil?: string; // ISO date
}

interface Subscriber extends User {
  plan: "monthly" | "yearly";
  subscribedAt: string;
  renewsAt: string;
  value: number;
}

interface SystemConfig {
  freeDailyDownloads: number;
  premiumDailyDownloads: number;
  freeMaxSizeMb: number;
  openRegistration: boolean;
  requireEmailVerification: boolean;
  maintenanceMode: boolean;
  tempBanHours: number;
  maxLoginAttempts: number;
  autoBanOnExceed: boolean;
}

interface BanPayload {
  userId: string;
  type: "temporary" | "permanent";
  durationHours?: number;
  reason: string;
}

interface StatsUsers {
  total: number;
  online: number;
  banned: number;
  newLast24h: number;
}

interface StatsSubscribers {
  total: number;
  revenueMonth: number;
  churnRate: number;
  newThisMonth: number;
}

// ── API CLASS ─────────────────────────────────────────
// BACKEND LINK: edite os métodos abaixo para apontar para seus endpoints reais.
class Api {
  private static headers(): HeadersInit {
    return {
      "Content-Type": "application/json",
      // BACKEND LINK: ajuste o header de autenticação
      "Authorization": `Bearer ${getAuthToken()}`,
    };
  }

  private static async req<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...this.headers(), ...(options.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res.json() as Promise<T>;
  }

  // ── GAMES ─────────────────────────────────────────
  // BACKEND LINK: GET /api/games?platform=&status=&search=
  static fetchGames(params?: { platform?: string; status?: string; search?: string }): Promise<Game[]> {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return this.req<Game[]>(`/api/games${q ? "?" + q : ""}`);
  }

  // BACKEND LINK: POST /api/games  body: Omit<Game, 'id'|'downloads'>
  static createGame(data: Partial<Game>): Promise<Game> {
    return this.req<Game>("/api/games", { method: "POST", body: JSON.stringify(data) });
  }

  // BACKEND LINK: PUT /api/games/:id  body: Partial<Game>
  static updateGame(id: string, data: Partial<Game>): Promise<Game> {
    return this.req<Game>(`/api/games/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  // BACKEND LINK: DELETE /api/games/:id
  static deleteGame(id: string): Promise<void> {
    return this.req<void>(`/api/games/${id}`, { method: "DELETE" });
  }

  // ── USERS ─────────────────────────────────────────
  // BACKEND LINK: GET /api/users?status=&search=
  static fetchUsers(params?: { status?: string; search?: string }): Promise<User[]> {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return this.req<User[]>(`/api/users${q ? "?" + q : ""}`);
  }

  // BACKEND LINK: GET /api/users/stats
  static fetchUserStats(): Promise<StatsUsers> {
    return this.req<StatsUsers>("/api/users/stats");
  }

  // BACKEND LINK: POST /api/users/:id/ban  body: BanPayload
  static banUser(payload: BanPayload): Promise<void> {
    return this.req<void>(`/api/users/${payload.userId}/ban`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // BACKEND LINK: POST /api/users/:id/unban
  static unbanUser(userId: string): Promise<void> {
    return this.req<void>(`/api/users/${userId}/unban`, { method: "POST" });
  }

  // ── SUBSCRIBERS ───────────────────────────────────
  // BACKEND LINK: GET /api/subscribers?plan=&search=
  static fetchSubscribers(params?: { plan?: string; search?: string }): Promise<Subscriber[]> {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return this.req<Subscriber[]>(`/api/subscribers${q ? "?" + q : ""}`);
  }

  // BACKEND LINK: GET /api/subscribers/stats
  static fetchSubscriberStats(): Promise<StatsSubscribers> {
    return this.req<StatsSubscribers>("/api/subscribers/stats");
  }

  // ── SYSTEM CONFIG ─────────────────────────────────
  // BACKEND LINK: GET /api/config
  static fetchConfig(): Promise<SystemConfig> {
    return this.req<SystemConfig>("/api/config");
  }

  // BACKEND LINK: PATCH /api/config  body: Partial<SystemConfig>
  static saveConfig(data: Partial<SystemConfig>): Promise<SystemConfig> {
    return this.req<SystemConfig>("/api/config", { method: "PATCH", body: JSON.stringify(data) });
  }

  // ── LOGS ──────────────────────────────────────────
  // ⚡ BACKEND LINK: GET /api/logs?limit=100
  static fetchLogs(): Promise<{ timestamp: string; type: string; message: string }[]> {
    return this.req("/api/logs?limit=100");
  }
}

// ── MOCK DATA (remova quando conectar o backend) ──────
const MOCK_GAMES: Game[] = [
  { id: "g001", title: "Street Fighter II", platform: "arcade", year: 1991, developer: "Capcom", downloadLink: "https://example.com/sf2.zip", coverUrl: "", description: "Fighting classic.", sizeMb: 32, downloads: 4821, status: "active" },
  { id: "g002", title: "Donkey Kong", platform: "arcade", year: 1981, developer: "Nintendo", downloadLink: "https://example.com/dk.zip", coverUrl: "", description: "Platformer legend.", sizeMb: 4, downloads: 3109, status: "active" },
  { id: "g003", title: "Sonic the Hedgehog", platform: "console", year: 1991, developer: "Sega", downloadLink: "https://example.com/sonic.zip", coverUrl: "", description: "Blue blur.", sizeMb: 512, downloads: 6204, status: "active" },
  { id: "g004", title: "Tetris", platform: "handheld", year: 1989, developer: "Nintendo", downloadLink: "https://example.com/tetris.zip", coverUrl: "", description: "Block puzzle.", sizeMb: 1, downloads: 9102, status: "active" },
  { id: "g005", title: "Space Invaders", platform: "arcade", year: 1978, developer: "Taito", downloadLink: "https://example.com/si.zip", coverUrl: "", description: "Shooter pioneer.", sizeMb: 2, downloads: 2750, status: "hidden" },
];

const MOCK_USERS: User[] = [
  { id: "u001", username: "ARCHV_9921", email: "archv@test.com", lastLogin: "2025-05-14T18:22:00Z", dailyDownloads: 1, isSubscriber: true, status: "active" },
  { id: "u002", username: "R3TRO_BOY", email: "retro@test.com", lastLogin: "2025-05-15T08:01:00Z", dailyDownloads: 3, isSubscriber: false, status: "active" },
  { id: "u003", username: "PIXEL_KID", email: "pixel@test.com", lastLogin: "2025-05-10T12:00:00Z", dailyDownloads: 0, isSubscriber: false, status: "banned", banUntil: "2025-05-22T00:00:00Z" },
  { id: "u004", username: "CART_RIDER", email: "cart@test.com", lastLogin: "2025-05-13T20:45:00Z", dailyDownloads: 0, isSubscriber: true, status: "active" },
];

const MOCK_SUBS: Subscriber[] = [
  { id: "u001", username: "ARCHV_9921", email: "archv@test.com", lastLogin: "2025-05-14T18:22:00Z", dailyDownloads: 1, isSubscriber: true, status: "active", plan: "monthly", subscribedAt: "2025-01-10T00:00:00Z", renewsAt: "2025-06-10T00:00:00Z", value: 24.90 },
  { id: "u004", username: "CART_RIDER", email: "cart@test.com", lastLogin: "2025-05-13T20:45:00Z", dailyDownloads: 0, isSubscriber: true, status: "active", plan: "yearly", subscribedAt: "2024-11-01T00:00:00Z", renewsAt: "2025-11-01T00:00:00Z", value: 199.90 },
];

// ── HELPERS ───────────────────────────────────────────
function fmtDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function fmtBRL(val: number): string {
  return `R$ ${val.toFixed(2).replace(".", ",")}`;
}

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function showToast(msg: string, type: "success" | "error" | "warn" = "success"): void {
  const toast = el("toast");
  const toastMsg = el("toast-msg");
  const icon = toast.querySelector(".toast__icon") as HTMLElement;

  toastMsg.textContent = msg;
  toast.className = `toast toast--${type}`;
  icon.textContent = type === "success" ? "▸" : type === "error" ? "✕" : "⚠";

  setTimeout(() => toast.classList.add("hidden"), 3000);
}

// ── MODAL SYSTEM ──────────────────────────────────────
function openModal(id: string): void { el(id).classList.remove("hidden"); }
function closeModal(id: string): void { el(id).classList.add("hidden"); }

let confirmCallback: (() => void) | null = null;
function showConfirm(msg: string, onConfirm: () => void): void {
  el("confirm-msg").textContent = msg;
  confirmCallback = onConfirm;
  openModal("modal-confirm");
}

// ── NAV ───────────────────────────────────────────────
const sections: Record<string, string> = {
  games: "// GAMES_MATRIX",
  users: "// USER_LOG_MATRIX",
  subscribers: "// SUBSCRIBER_BROADCAST",
  settings: "// SYSTEM_CONFIG",
  logs: "// SYS_LOG_TERMINAL",
};

document.querySelectorAll<HTMLAnchorElement>(".nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const target = item.dataset.section!;
    document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
    item.classList.add("active");
    document.querySelectorAll(".section").forEach((s) => s.classList.add("hidden"));
    el(`section-${target}`)?.classList.remove("hidden");
    el("current-section-label").textContent = sections[target] ?? "";
    sectionDidMount(target);
  });
});

// ── TIMESTAMP ─────────────────────────────────────────
function updateTimestamp(): void {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  el("timestamp").textContent = `TIME_STAMP: ${now.getFullYear()}.${pad(now.getMonth()+1)}.${pad(now.getDate())}_${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
setInterval(updateTimestamp, 1000);
updateTimestamp();

// ── GAMES SECTION ─────────────────────────────────────
let allGames: Game[] = [];
let editingGameId: string | null = null;

async function loadGames(): Promise<void> {
  try {
    // BACKEND LINK: troque MOCK_GAMES por: allGames = await Api.fetchGames();
    allGames = [...MOCK_GAMES];
    renderGamesTable(allGames);
  } catch (err) {
    showToast("ERRO AO CARREGAR GAMES", "error");
  }
}

function renderGamesTable(games: Game[]): void {
  const tbody = el("games-tbody");
  const empty = el("games-empty");
  el("games-count").textContent = `TOTAL: ${games.length} REGISTROS`;

  if (games.length === 0) {
    tbody.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  tbody.innerHTML = games.map((g) => `
    <tr data-id="${g.id}">
      <td class="text-muted">${g.id}</td>
      <td>${g.title}</td>
      <td>${g.platform.toUpperCase()}</td>
      <td>${g.year}</td>
      <td>${g.downloads.toLocaleString("pt-BR")}</td>
      <td><span class="badge badge--${g.status === "active" ? "active" : "hidden"}">${g.status.toUpperCase()}</span></td>
      <td>
        <div class="actions-cell">
          <button class="btn btn--ghost btn--icon" data-action="edit-game" data-id="${g.id}" title="Editar">✎</button>
          <button class="btn btn--ghost btn--icon" data-action="delete-game" data-id="${g.id}" title="Excluir">✕</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function filterGames(): void {
  const search = (el<HTMLInputElement>("games-search").value ?? "").toLowerCase();
  const platform = el<HTMLSelectElement>("games-platform-filter").value;
  const status = el<HTMLSelectElement>("games-status-filter").value;
  const filtered = allGames.filter((g) => {
    const matchSearch = !search || g.title.toLowerCase().includes(search) || g.developer.toLowerCase().includes(search);
    const matchPlatform = !platform || g.platform === platform;
    const matchStatus = !status || g.status === status;
    return matchSearch && matchPlatform && matchStatus;
  });
  renderGamesTable(filtered);
}

function openGameModal(game?: Game): void {
  editingGameId = game?.id ?? null;
  el("modal-game-title").textContent = game ? "EDITAR_JOGO" : "INSERIR_JOGO";
  (el<HTMLInputElement>("game-form-title")).value = game?.title ?? "";
  (el<HTMLSelectElement>("game-form-platform")).value = game?.platform ?? "arcade";
  (el<HTMLInputElement>("game-form-year")).value = String(game?.year ?? "");
  (el<HTMLInputElement>("game-form-dev")).value = game?.developer ?? "";
  (el<HTMLInputElement>("game-form-link")).value = game?.downloadLink ?? "";
  (el<HTMLInputElement>("game-form-cover")).value = game?.coverUrl ?? "";
  (el<HTMLTextAreaElement>("game-form-desc")).value = game?.description ?? "";
  (el<HTMLInputElement>("game-form-size")).value = String(game?.sizeMb ?? "");
  (el<HTMLSelectElement>("game-form-status")).value = game?.status ?? "active";
  openModal("modal-game");
}

async function saveGame(): Promise<void> {
  const data: Partial<Game> = {
    title:        (el<HTMLInputElement>("game-form-title")).value.trim(),
    platform:     (el<HTMLSelectElement>("game-form-platform")).value as Game["platform"],
    year:         Number((el<HTMLInputElement>("game-form-year")).value),
    developer:    (el<HTMLInputElement>("game-form-dev")).value.trim(),
    downloadLink: (el<HTMLInputElement>("game-form-link")).value.trim(),
    coverUrl:     (el<HTMLInputElement>("game-form-cover")).value.trim(),
    description:  (el<HTMLTextAreaElement>("game-form-desc")).value.trim(),
    sizeMb:       Number((el<HTMLInputElement>("game-form-size")).value),
    status:       (el<HTMLSelectElement>("game-form-status")).value as Game["status"],
  };

  if (!data.title) { showToast("TÍTULO OBRIGATÓRIO", "error"); return; }

  try {
    if (editingGameId) {
      // BACKEND LINK: await Api.updateGame(editingGameId, data);
      const idx = allGames.findIndex((g) => g.id === editingGameId);
      if (idx !== -1) allGames[idx] = { ...allGames[idx], ...data };
      showToast("JOGO ATUALIZADO", "success");
    } else {
      // BACKEND LINK: const created = await Api.createGame(data); allGames.unshift(created);
      const newGame: Game = { id: `g${Date.now()}`, downloads: 0, ...data } as Game;
      allGames.unshift(newGame);
      showToast("JOGO INSERIDO", "success");
    }
    closeModal("modal-game");
    renderGamesTable(allGames);
  } catch {
    showToast("ERRO AO SALVAR JOGO", "error");
  }
}

async function deleteGame(id: string): Promise<void> {
  showConfirm("EXCLUIR ESTE JOGO DO SISTEMA?", async () => {
    try {
      // BACKEND LINK: await Api.deleteGame(id);
      allGames = allGames.filter((g) => g.id !== id);
      renderGamesTable(allGames);
      showToast("JOGO REMOVIDO", "warn");
    } catch {
      showToast("ERRO AO EXCLUIR", "error");
    }
  });
}

// ── USERS SECTION ─────────────────────────────────────
let allUsers: User[] = [];

async function loadUsers(): Promise<void> {
  try {
    // BACKEND LINK: const [users, stats] = await Promise.all([Api.fetchUsers(), Api.fetchUserStats()]);
    allUsers = [...MOCK_USERS];
    const stats = { total: 4, online: 2, banned: 1, newLast24h: 1 };
    el("stat-total-users").textContent = String(stats.total);
    el("stat-online").textContent = String(stats.online);
    el("stat-banned").textContent = String(stats.banned);
    el("stat-new").textContent = String(stats.newLast24h);
    renderUsersTable(allUsers);
  } catch {
    showToast("ERRO AO CARREGAR USUÁRIOS", "error");
  }
}

function renderUsersTable(users: User[]): void {
  const tbody = el("users-tbody");
  const empty = el("users-empty");
  if (users.length === 0) { tbody.innerHTML = ""; empty.classList.remove("hidden"); return; }
  empty.classList.add("hidden");
  tbody.innerHTML = users.map((u) => `
    <tr>
      <td class="text-muted">${u.id}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>${fmtDate(u.lastLogin)}</td>
      <td>${u.dailyDownloads}</td>
      <td>
        <span class="badge badge--${u.status === "active" ? "active" : "banned"}">${u.status.toUpperCase()}</span>
        ${u.isSubscriber ? '<span class="badge badge--sub" style="margin-left:4px">SUB</span>' : ""}
      </td>
      <td>
        <div class="actions-cell">
          ${u.status === "active"
            ? `<button class="btn btn--ghost btn--icon" data-action="ban-user" data-id="${u.id}" data-name="${u.username}" title="Banir">⊘</button>`
            : `<button class="btn btn--ghost btn--icon" data-action="unban-user" data-id="${u.id}" title="Desbanir">↺</button>`}
        </div>
      </td>
    </tr>
  `).join("");
}

function filterUsers(): void {
  const search = (el<HTMLInputElement>("users-search").value ?? "").toLowerCase();
  const status = el<HTMLSelectElement>("users-status-filter").value;
  const filtered = allUsers.filter((u) => {
    const matchSearch = !search || u.username.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
    const matchStatus = !status || u.status === status;
    return matchSearch && matchStatus;
  });
  renderUsersTable(filtered);
}

// ── BAN MODAL ─────────────────────────────────────────
let banTargetId: string | null = null;

function openBanModal(userId: string, username: string): void {
  banTargetId = userId;
  el("ban-target-name").textContent = username;
  (el<HTMLSelectElement>("ban-type")).value = "temporary";
  el("ban-duration-row").style.display = "";
  openModal("modal-ban");
}

async function executeBan(): Promise<void> {
  if (!banTargetId) return;
  const type = (el<HTMLSelectElement>("ban-type")).value as BanPayload["type"];
  const duration = Number((el<HTMLInputElement>("ban-duration")).value);
  const reason = (el<HTMLTextAreaElement>("ban-reason")).value.trim();
  if (!reason) { showToast("MOTIVO OBRIGATÓRIO", "error"); return; }

  try {
    const payload: BanPayload = { userId: banTargetId, type, durationHours: type === "temporary" ? duration : undefined, reason };
    // BACKEND LINK: await Api.banUser(payload);
    const idx = allUsers.findIndex((u) => u.id === banTargetId);
    if (idx !== -1) allUsers[idx].status = "banned";
    renderUsersTable(allUsers);
    closeModal("modal-ban");
    showToast("BAN EXECUTADO", "warn");
  } catch {
    showToast("ERRO AO EXECUTAR BAN", "error");
  }
}

async function unbanUser(userId: string): Promise<void> {
  showConfirm("REMOVER BAN DESTE USUÁRIO?", async () => {
    try {
      // BACKEND LINK: await Api.unbanUser(userId);
      const idx = allUsers.findIndex((u) => u.id === userId);
      if (idx !== -1) allUsers[idx].status = "active";
      renderUsersTable(allUsers);
      showToast("BAN REMOVIDO", "success");
    } catch {
      showToast("ERRO AO REMOVER BAN", "error");
    }
  });
}

// ── SUBSCRIBERS SECTION ───────────────────────────────
async function loadSubscribers(): Promise<void> {
  try {
    // BACKEND LINK: const [subs, stats] = await Promise.all([Api.fetchSubscribers(), Api.fetchSubscriberStats()]);
    const subs = MOCK_SUBS;
    const stats = { total: 2, revenueMonth: 224.80, churnRate: 2.1, newThisMonth: 1 };
    el("stat-subs").textContent = String(stats.total);
    el("stat-revenue").textContent = fmtBRL(stats.revenueMonth);
    el("stat-churn").textContent = `${stats.churnRate}%`;
    el("stat-new-subs").textContent = String(stats.newThisMonth);
    renderSubsTable(subs);
  } catch {
    showToast("ERRO AO CARREGAR ASSINANTES", "error");
  }
}

function renderSubsTable(subs: Subscriber[]): void {
  const tbody = el("subs-tbody");
  const empty = el("subs-empty");
  if (subs.length === 0) { tbody.innerHTML = ""; empty.classList.remove("hidden"); return; }
  empty.classList.add("hidden");
  tbody.innerHTML = subs.map((s) => `
    <tr>
      <td>${s.id}</td>
      <td>${s.username}</td>
      <td><span class="badge badge--sub">${s.plan.toUpperCase()}</span></td>
      <td>${fmtDate(s.subscribedAt)}</td>
      <td>${fmtDate(s.renewsAt)}</td>
      <td>${fmtBRL(s.value)}</td>
      <td><span class="badge badge--${s.status === "active" ? "active" : "banned"}">${s.status.toUpperCase()}</span></td>
      <td>
        <div class="actions-cell">
          <button class="btn btn--ghost btn--icon" data-action="ban-user" data-id="${s.id}" data-name="${s.username}" title="Banir">⊘</button>
        </div>
      </td>
    </tr>
  `).join("");
}

// ── SETTINGS SECTION ──────────────────────────────────
async function loadSettings(): Promise<void> {
  try {
    // BACKEND LINK: const cfg = await Api.fetchConfig();
    const cfg: SystemConfig = {
      freeDailyDownloads: 3, premiumDailyDownloads: 999, freeMaxSizeMb: 500,
      openRegistration: true, requireEmailVerification: true, maintenanceMode: false,
      tempBanHours: 24, maxLoginAttempts: 5, autoBanOnExceed: true,
    };
    (el<HTMLInputElement>("cfg-free-daily")).value = String(cfg.freeDailyDownloads);
    (el<HTMLInputElement>("cfg-premium-daily")).value = String(cfg.premiumDailyDownloads);
    (el<HTMLInputElement>("cfg-free-size")).value = String(cfg.freeMaxSizeMb);
    (el<HTMLInputElement>("cfg-open-reg")).checked = cfg.openRegistration;
    (el<HTMLInputElement>("cfg-verify-email")).checked = cfg.requireEmailVerification;
    (el<HTMLInputElement>("cfg-maintenance")).checked = cfg.maintenanceMode;
    (el<HTMLInputElement>("cfg-temp-ban-hours")).value = String(cfg.tempBanHours);
    (el<HTMLInputElement>("cfg-max-login")).value = String(cfg.maxLoginAttempts);
    (el<HTMLInputElement>("cfg-auto-ban")).checked = cfg.autoBanOnExceed;
  } catch {
    showToast("ERRO AO CARREGAR CONFIG", "error");
  }
}

async function saveDownloadConfig(): Promise<void> {
  const data: Partial<SystemConfig> = {
    freeDailyDownloads: Number((el<HTMLInputElement>("cfg-free-daily")).value),
    premiumDailyDownloads: Number((el<HTMLInputElement>("cfg-premium-daily")).value),
    freeMaxSizeMb: Number((el<HTMLInputElement>("cfg-free-size")).value),
  };
  try {
    // BACKEND LINK: await Api.saveConfig(data);
    showToast("DOWNLOAD_CONFIG SALVO", "success");
  } catch {
    showToast("ERRO AO SALVAR", "error");
  }
}

async function saveRegConfig(): Promise<void> {
  const data: Partial<SystemConfig> = {
    openRegistration: (el<HTMLInputElement>("cfg-open-reg")).checked,
    requireEmailVerification: (el<HTMLInputElement>("cfg-verify-email")).checked,
    maintenanceMode: (el<HTMLInputElement>("cfg-maintenance")).checked,
  };
  try {
    // ⚡ BACKEND LINK: await Api.saveConfig(data);
    showToast("REG_CONFIG SALVO", "success");
  } catch {
    showToast("ERRO AO SALVAR", "error");
  }
}

async function saveBanConfig(): Promise<void> {
  const data: Partial<SystemConfig> = {
    tempBanHours: Number((el<HTMLInputElement>("cfg-temp-ban-hours")).value),
    maxLoginAttempts: Number((el<HTMLInputElement>("cfg-max-login")).value),
    autoBanOnExceed: (el<HTMLInputElement>("cfg-auto-ban")).checked,
  };
  try {
    // ⚡ BACKEND LINK: await Api.saveConfig(data);
    showToast("BAN_CONFIG SALVO", "success");
  } catch {
    showToast("ERRO AO SALVAR", "error");
  }
}

// ── LOGS SECTION ──────────────────────────────────────
const MOCK_LOGS = [
  { timestamp: "2025-05-15T08:01:00Z", type: "ok",    message: "ACESSO_RENOVADO [TRANS_ID: 99181-X]" },
  { timestamp: "2025-05-14T23:11:00Z", type: "ok",    message: "NOVO_USUÁRIO_REGISTRADO [USER: CART_RIDER]" },
  { timestamp: "2025-05-14T20:30:00Z", type: "warn",  message: "LIMITE_DOWNLOAD_ATINGIDO [USER: R3TRO_BOY]" },
  { timestamp: "2025-05-13T15:22:00Z", type: "error", message: "FALHA_NA_SINCRONIZAÇÃO [ERRO_CARTÃO]" },
  { timestamp: "2025-05-12T10:05:00Z", type: "ok",    message: "UPGRADE_REALIZADO [ESTÁTICO → DECODIFICADOR]" },
  { timestamp: "2025-05-10T09:18:00Z", type: "warn",  message: "BAN_EXECUTADO [USER: PIXEL_KID | 24h]" },
];

async function loadLogs(): Promise<void> {
  const body = el("log-body");
  try {
    // ⚡ BACKEND LINK: const logs = await Api.fetchLogs();
    const logs = MOCK_LOGS;
    body.innerHTML = logs.map((l) => {
      const typeClass = l.type === "ok" ? "log-ok" : l.type === "error" ? "log-error" : "log-warn";
      return `<div class="log-entry">
        <span class="log-date">> ${fmtDate(l.timestamp)}</span>
        <span class="log-event"> — </span>
        <span class="${typeClass}">${l.message}</span>
      </div>`;
    }).join("");
    body.scrollTop = body.scrollHeight;
  } catch {
    showToast("ERRO AO CARREGAR LOGS", "error");
  }
}

// ── SECTION MOUNT ─────────────────────────────────────
function sectionDidMount(section: string): void {
  switch (section) {
    case "games":       loadGames(); break;
    case "users":       loadUsers(); break;
    case "subscribers": loadSubscribers(); break;
    case "settings":    loadSettings(); break;
    case "logs":        loadLogs(); break;
  }
}

// ── GLOBAL EVENT DELEGATION ───────────────────────────
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const btn = target.closest("[data-action]") as HTMLElement | null;
  if (!btn) return;

  const action = btn.dataset.action!;
  const id = btn.dataset.id ?? "";
  const name = btn.dataset.name ?? "";

  switch (action) {
    case "edit-game":   { const g = allGames.find((x) => x.id === id); openGameModal(g); break; }
    case "delete-game": deleteGame(id); break;
    case "ban-user":    openBanModal(id, name); break;
    case "unban-user":  unbanUser(id); break;
  }
});

// Games section
el("btn-add-game").addEventListener("click", () => openGameModal());
el("modal-game-save").addEventListener("click", saveGame);
el("modal-game-close").addEventListener("click", () => closeModal("modal-game"));
el("modal-game-cancel").addEventListener("click", () => closeModal("modal-game"));

// Ban modal
el("modal-ban-confirm").addEventListener("click", executeBan);
el("modal-ban-close").addEventListener("click", () => closeModal("modal-ban"));
el("modal-ban-cancel").addEventListener("click", () => closeModal("modal-ban"));
el<HTMLSelectElement>("ban-type").addEventListener("change", (e) => {
  const isPerm = (e.target as HTMLSelectElement).value === "permanent";
  el("ban-duration-row").style.display = isPerm ? "none" : "";
});

// Confirm modal
el("modal-confirm-ok").addEventListener("click", () => { confirmCallback?.(); closeModal("modal-confirm"); });
el("modal-confirm-close").addEventListener("click", () => closeModal("modal-confirm"));
el("modal-confirm-cancel").addEventListener("click", () => closeModal("modal-confirm"));

// Filters
el("games-search").addEventListener("input", filterGames);
el("games-platform-filter").addEventListener("change", filterGames);
el("games-status-filter").addEventListener("change", filterGames);
el("users-search").addEventListener("input", filterUsers);

// Settings save buttons
el("btn-save-downloads").addEventListener("click", saveDownloadConfig);
el("btn-save-reg").addEventListener("click", saveRegConfig);
el("btn-save-ban").addEventListener("click", saveBanConfig);

// Logs clear
el("btn-clear-logs").addEventListener("click", () => { el("log-body").innerHTML = ""; });

// Close modals on backdrop click
document.querySelectorAll<HTMLElement>(".modal-backdrop").forEach((backdrop) => {
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) backdrop.classList.add("hidden");
  });
});

// ── INIT ──────────────────────────────────────────────
loadGames();