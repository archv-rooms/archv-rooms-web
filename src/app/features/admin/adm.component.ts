import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../core/services/game.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adm.component.html',
  styleUrls: ['./adm.component.scss']
})
export class AdmComponent implements OnInit {

  constructor(
    private gameService: GameService,
    private userService: UserService
  ) {}

  currentSection = 'games';

  loading = false;
  errorMessage = '';

  // =========================
  // GAMES
  // =========================

  games: any[] = [];
  filteredGames: any[] = [];

  gameSearch = '';
  gamePlatformFilter = 'all';
  gameStatusFilter = 'all';

  showGameModal = false;
  editingGame = false;

  gameForm: any = {
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

  users: any[] = [];
  filteredUsers: any[] = [];

  userSearch = '';
  userStatusFilter = 'all';

  showBanModal = false;
  selectedUser: any = null;

  banForm = {
    type: 'temporary',
    durationHours: 24,
    reason: ''
  };

  userStats = {
    total: 0,
    online: 0,
    banned: 0,
    newLast24h: 0
  };

  ngOnInit(): void {
    this.loadGames();
    this.loadUsers();
  }

  // =========================
  // LOAD GAMES
  // =========================

  loadGames(): void {
    this.loading = true;

    this.gameService.getGames().subscribe({
      next: (res) => {
        this.games = res.data;
        this.filteredGames = res.data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar jogos';
        this.loading = false;
      }
    });
  }

  // =========================
  // LOAD USERS + STATS
  // =========================

  loadUsers(): void {
    this.loading = true;

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;

        this.userStats.total = data.length;
        this.userStats.banned = data.filter(u => u.status === 'banned').length;

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar usuários';
        this.loading = false;
      }
    });

    this.userService.getAdminStats().subscribe({
      next: (stats) => {
        this.userStats = stats;
      },
      error: () => {}
    });
  }

  // =========================
  // FILTER USERS
  // =========================

  filterUsers(): void {
    const search = this.userSearch.toLowerCase();

    this.filteredUsers = this.users.filter(user => {
      const matchSearch =
        user.username?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search);

      const matchStatus =
        this.userStatusFilter === '' ||
        user.status === this.userStatusFilter;

      return matchSearch && matchStatus;
    });
  }

  // =========================
  // BAN SYSTEM
  // =========================

  openBanModal(user: any): void {
    this.selectedUser = user;
    this.showBanModal = true;
  }

  closeBanModal(): void {
    this.showBanModal = false;
    this.selectedUser = null;
  }

  executeBan(): void {
    if (!this.selectedUser) return;

    this.userService.banUser(this.selectedUser.id, this.banForm).subscribe({
      next: () => {
        this.selectedUser.status = 'banned';
        this.filterUsers();
        this.closeBanModal();
      },
      error: () => alert('Erro ao banir usuário')
    });
  }

  unbanUser(id: number): void {
    this.userService.unbanUser(id).subscribe({
      next: () => {
        const user = this.users.find(u => u.id === id);
        if (user) user.status = 'active';

        this.filterUsers();
      },
      error: () => alert('Erro ao desbanir usuário')
    });
  }

  // =========================
  // GAMES FILTER
  // =========================

  filterGames(): void {
    const search = this.gameSearch.toLowerCase();

    this.filteredGames = this.games.filter(game => {
      return (
        game.title?.toLowerCase().includes(search) ||
        game.developer?.toLowerCase().includes(search)
      );
    });
  }

  // =========================
  // MODALS GAMES
  // =========================

  openGameModal(game?: any): void {
    this.showGameModal = true;

    if (game) {
      this.editingGame = true;
      this.gameForm = { ...game };
    } else {
      this.editingGame = false;
    }
  }

  closeGameModal(): void {
    this.showGameModal = false;
  }

  changeSection(section: string): void {
    this.currentSection = section;
  }

  // =========================
// SAVE GAME (criar ou editar)
// =========================

saveGame(): void {
  if (this.editingGame) {
    this.gameService.updateGame(this.gameForm.id, this.gameForm).subscribe({
      next: () => {
        const index = this.games.findIndex(g => g.id === this.gameForm.id);
        if (index !== -1) this.games[index] = { ...this.gameForm };
        this.filterGames();
        this.closeGameModal();
      },
      error: () => alert('Erro ao atualizar jogo')
    });
  } else {
    this.gameService.createGame(this.gameForm).subscribe({
      next: (novoJogo) => {
        this.games.push(novoJogo);
        this.filterGames();
        this.closeGameModal();
      },
      error: () => alert('Erro ao criar jogo')
    });
  }
}

// =========================
// DELETE GAME
// =========================

 deleteGame(id: string): void {
  if (!confirm('Tem certeza que deseja excluir este jogo?')) return;

  this.gameService.deleteGame(id).subscribe({
    next: () => {
      this.games = this.games.filter(g => g.id !== id);
      this.filterGames();
    },
    error: () => alert('Erro ao excluir jogo')
  });
}
}