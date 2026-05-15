import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Game {
  id: string;
  title: string;
  platform: 'arcade' | 'console' | 'handheld';
  year: number;
  developer: string;
  downloadLink: string;
  coverUrl: string;
  description: string;
  sizeMb: number;
  downloads: number;
  status: 'active' | 'hidden';
}

interface User {
  id: string;
  username: string;
  email: string;
  lastLogin: string;
  dailyDownloads: number;
  isSubscriber: boolean;
  status: 'active' | 'banned';
  banUntil?: string;
}

interface Subscriber extends User {
  plan: 'monthly' | 'yearly';
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

@Component({
  selector: 'app-adm',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './adm.component.html',
  styleUrls: ['./adm.component.scss']
})
export class AdmComponent implements OnInit {

  private http = inject(HttpClient);

  private BASE_URL = 'https://api.archvrooms.com.br';

  currentSection = 'games';

  loading = false;
  errorMessage = '';

  // =========================
  // GAMES
  // =========================

  games: Game[] = [];
  filteredGames: Game[] = [];

  gameSearch = '';
  gamePlatformFilter = 'all';
  gameStatusFilter = 'all';

  showGameModal = false;
  editingGame = false;

  gameForm: Partial<Game> = {
    title: '',
    platform: 'arcade',
    year: new Date().getFullYear(),
    developer: '',
    downloadLink: '',
    coverUrl: '',
    description: '',
    sizeMb: 0,
    downloads: 0,
    status: 'active'
  };

  // =========================
  // USERS
  // =========================

  users: User[] = [];
  filteredUsers: User[] = [];

  userSearch = '';
  userStatusFilter = 'all';

  showBanModal = false;
  selectedUser: User | null = null;

  banForm = {
    type: 'temporary',
    durationHours: 24,
    reason: ''
  };

  // =========================
  // STATS
  // =========================

  userStats = {
    total: 0,
    online: 0,
    banned: 0,
    newLast24h: 0
  };

  // =========================
  // SUBSCRIBERS
  // =========================

  subscribers: Subscriber[] = [];

  // =========================
  // CONFIG
  // =========================

  config: SystemConfig = {
    freeDailyDownloads: 3,
    premiumDailyDownloads: 999,
    freeMaxSizeMb: 500,
    openRegistration: true,
    requireEmailVerification: false,
    maintenanceMode: false,
    tempBanHours: 24,
    maxLoginAttempts: 5,
    autoBanOnExceed: true
  };

  ngOnInit(): void {
    this.loadGames();
    this.loadUsers();
    this.loadSubscribers();
  }

  // =====================================================
  // LOADERS
  // =====================================================

  loadGames(): void {

    this.loading = true;

    this.http.get<Game[]>(`${this.BASE_URL}/api/games`)
      .subscribe({
        next: (response) => {

          this.games = response;
          this.filteredGames = response;

          this.loading = false;
        },

        error: (err) => {

          this.errorMessage =
            err.error?.message || 'Erro ao carregar jogos';

          this.loading = false;
        }
      });
  }

  loadUsers(): void {

    this.http.get<User[]>(`${this.BASE_URL}/api/users`)
      .subscribe({
        next: (response) => {

          this.users = response;
          this.filteredUsers = response;

          this.updateUserStats();
        },

        error: () => {
          alert('Erro ao carregar usuários');
        }
      });
  }

  loadSubscribers(): void {

    this.http.get<Subscriber[]>(
      `${this.BASE_URL}/api/subscribers`
    )
    .subscribe({
      next: (response) => {
        this.subscribers = response;
      },

      error: () => {
        alert('Erro ao carregar assinantes');
      }
    });
  }

  // =====================================================
  // GAME FILTERS
  // =====================================================

  filterGames(): void {

    this.filteredGames = this.games.filter(game => {

      const matchSearch =
        game.title.toLowerCase().includes(this.gameSearch.toLowerCase()) ||
        game.developer.toLowerCase().includes(this.gameSearch.toLowerCase());

      const matchPlatform =
        this.gamePlatformFilter === 'all' ||
        game.platform === this.gamePlatformFilter;

      const matchStatus =
        this.gameStatusFilter === 'all' ||
        game.status === this.gameStatusFilter;

      return matchSearch && matchPlatform && matchStatus;
    });
  }

  // =====================================================
  // USER FILTERS
  // =====================================================

  filterUsers(): void {

    this.filteredUsers = this.users.filter(user => {

      const matchSearch =
        user.username.toLowerCase().includes(this.userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(this.userSearch.toLowerCase());

      const matchStatus =
        this.userStatusFilter === 'all' ||
        user.status === this.userStatusFilter;

      return matchSearch && matchStatus;
    });
  }

  // =====================================================
  // GAME MODAL
  // =====================================================

  openGameModal(game?: Game): void {

    this.showGameModal = true;

    if (game) {

      this.editingGame = true;

      this.gameForm = {
        ...game
      };

    } else {

      this.editingGame = false;

      this.gameForm = {
        title: '',
        platform: 'arcade',
        year: new Date().getFullYear(),
        developer: '',
        downloadLink: '',
        coverUrl: '',
        description: '',
        sizeMb: 0,
        downloads: 0,
        status: 'active'
      };
    }
  }

  closeGameModal(): void {

    this.showGameModal = false;
  }

  saveGame(): void {

    if (this.editingGame && this.gameForm.id) {

      this.updateGame(this.gameForm.id);

    } else {

      this.createGame();
    }
  }

  createGame(): void {

    this.http.post<Game>(
      `${this.BASE_URL}/api/games`,
      this.gameForm
    )
    .subscribe({
      next: (game) => {

        this.games.unshift(game);

        this.filterGames();

        this.closeGameModal();

        alert('Jogo criado com sucesso');
      },

      error: () => {
        alert('Erro ao criar jogo');
      }
    });
  }

  updateGame(id: string): void {

    this.http.put<Game>(
      `${this.BASE_URL}/api/games/${id}`,
      this.gameForm
    )
    .subscribe({
      next: (updatedGame) => {

        const index = this.games.findIndex(g => g.id === id);

        if (index !== -1) {
          this.games[index] = updatedGame;
        }

        this.filterGames();

        this.closeGameModal();

        alert('Jogo atualizado');
      },

      error: () => {
        alert('Erro ao atualizar jogo');
      }
    });
  }

  deleteGame(id: string): void {

    const confirmed = confirm('Deseja excluir este jogo?');

    if (!confirmed) return;

    this.http.delete(`${this.BASE_URL}/api/games/${id}`)
      .subscribe({
        next: () => {

          this.games = this.games.filter(g => g.id !== id);

          this.filterGames();

          alert('Jogo removido');
        },

        error: () => {
          alert('Erro ao excluir jogo');
        }
      });
  }

  // =====================================================
  // USER ACTIONS
  // =====================================================

  openBanModal(user: User): void {

    this.selectedUser = user;

    this.showBanModal = true;
  }

  closeBanModal(): void {

    this.showBanModal = false;

    this.selectedUser = null;

    this.banForm = {
      type: 'temporary',
      durationHours: 24,
      reason: ''
    };
  }

  executeBan(): void {

    if (!this.selectedUser) return;

    this.http.post(
      `${this.BASE_URL}/api/users/${this.selectedUser.id}/ban`,
      this.banForm
    )
    .subscribe({
      next: () => {

        const user = this.users.find(
          u => u.id === this.selectedUser?.id
        );

        if (user) {
          user.status = 'banned';
        }

        this.filterUsers();

        this.updateUserStats();

        this.closeBanModal();

        alert('Usuário banido');
      },

      error: () => {
        alert('Erro ao banir usuário');
      }
    });
  }

  unbanUser(userId: string): void {

    this.http.post(
      `${this.BASE_URL}/api/users/${userId}/unban`,
      {}
    )
    .subscribe({
      next: () => {

        const user = this.users.find(u => u.id === userId);

        if (user) {
          user.status = 'active';
        }

        this.filterUsers();

        this.updateUserStats();

        alert('Ban removido');
      },

      error: () => {
        alert('Erro ao remover ban');
      }
    });
  }

  // =====================================================
  // CONFIG
  // =====================================================

  saveConfig(config: Partial<SystemConfig>): void {

    this.http.patch(
      `${this.BASE_URL}/api/config`,
      config
    )
    .subscribe({
      next: () => {
        alert('Configurações salvas');
      },

      error: () => {
        alert('Erro ao salvar configurações');
      }
    });
  }

  // =====================================================
  // STATS
  // =====================================================

  updateUserStats(): void {

    this.userStats.total = this.users.length;

    this.userStats.banned =
      this.users.filter(u => u.status === 'banned').length;

    this.userStats.online =
      this.users.filter(u => u.status === 'active').length;

    this.userStats.newLast24h =
      Math.floor(this.users.length * 0.1);
  }

  // =====================================================
  // HELPERS
  // =====================================================

  changeSection(section: string): void {

    this.currentSection = section;
  }

  formatDate(date: string): string {

    return new Date(date).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );
  }

  formatCurrency(value: number): string {

    return value.toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    );
  }
}