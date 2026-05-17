import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adm.component.html',
  styleUrls: ['./adm.component.scss']
})
export class AdmComponent implements OnInit {

  private api = 'http://localhost:3000';

  constructor(
    private gameService: GameService,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  currentSection = 'games';
  errorMessage = '';

  // GAMES
  games: any[] = [];
  filteredGames: any[] = [];
  gameSearch = '';
  gamePlatformFilter = '';
  showGameModal = false;
  editingGame = false;
  gameForm: any = { title: '', platform: 'arcade', coverUrl: '', accessLevel: 0, planId: null };

  // USERS
  users: any[] = [];
  filteredUsers: any[] = [];
  userSearch = '';
  userStats = { total: 0, online: 0, banned: 0, newLast24h: 0 };

  // CATEGORIES
  categories: any[] = [];
  showCategoryModal = false;
  editingCategory = false;
  categoryForm: any = { name: '' };

  ngOnInit(): void {
    this.loadGames();
    this.loadUsers();
    this.loadCategories();
  }

  private get authHeaders() {
    return { Authorization: `Bearer ${this.authService.getToken()}` };
  }

  // GAMES
  loadGames(): void {
    this.gameService.getGames().subscribe({
      next: (res) => { this.games = res.data; this.filteredGames = res.data; },
      error: () => this.errorMessage = 'Erro ao carregar jogos'
    });
  }

  filterGames(): void {
    const search = this.gameSearch.toLowerCase();
    this.filteredGames = this.games.filter(game => {
      const matchSearch = game.title?.toLowerCase().includes(search);
      const matchPlataforma = !this.gamePlatformFilter || game.console === this.gamePlatformFilter;
      return matchSearch && matchPlataforma;
    });
  }

  openGameModal(game?: any): void {
    this.showGameModal = true;
    this.editingGame = !!game;
    this.gameForm = game ? { ...game, platform: game.console } : { title: '', platform: 'arcade', coverUrl: '', accessLevel: 0, planId: null };
  }

  closeGameModal(): void { this.showGameModal = false; }

  changeSection(section: string): void { this.currentSection = section; }

  saveGame(): void {
    if (this.editingGame) {
      this.gameService.updateGame(this.gameForm.id, this.gameForm).subscribe({
        next: () => { this.loadGames(); this.closeGameModal(); },
        error: () => alert('Erro ao atualizar jogo')
      });
    } else {
      this.gameService.createGame(this.gameForm).subscribe({
        next: () => { this.loadGames(); this.closeGameModal(); },
        error: () => alert('Erro ao criar jogo')
      });
    }
  }

  deleteGame(id: string): void {
    if (!confirm('Excluir este jogo?')) return;
    this.gameService.deleteGame(id).subscribe({
      next: () => this.loadGames(),
      error: () => alert('Erro ao excluir jogo')
    });
  }

  // USERS
  loadUsers(): void {
    this.http.get<any>(`${this.api}/admin/users`, { headers: this.authHeaders }).subscribe({
      next: (res) => {
        this.users = res.data;
        this.filteredUsers = res.data;
        this.userStats.total = res.data.length;
      },
      error: () => this.errorMessage = 'Erro ao carregar usuários'
    });
  }

  filterUsers(): void {
    const search = this.userSearch.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.name?.toLowerCase().includes(search) || u.email?.toLowerCase().includes(search)
    );
  }

  toggleUserRole(user: any): void {
    const novoRole = user.role === 'admin' ? 'user' : 'admin';
    this.http.patch(`${this.api}/admin/users/${user.id}/role`, { role: novoRole }, { headers: this.authHeaders }).subscribe({
      next: () => user.role = novoRole,
      error: () => alert('Erro ao alterar role')
    });
  }

  // CATEGORIES
  loadCategories(): void {
    this.http.get<any>(`${this.api}/admin/categories`, { headers: this.authHeaders }).subscribe({
      next: (res) => this.categories = res.data,
      error: () => this.errorMessage = 'Erro ao carregar categorias'
    });
  }

  openCategoryModal(cat?: any): void {
    this.showCategoryModal = true;
    this.editingCategory = !!cat;
    this.categoryForm = cat ? { ...cat } : { name: '' };
  }

  closeCategoryModal(): void { this.showCategoryModal = false; }

  saveCategory(): void {
    const url = this.editingCategory
      ? `${this.api}/admin/categories/${this.categoryForm.id}`
      : `${this.api}/admin/categories`;

    const req = this.editingCategory
      ? this.http.put(url, { name: this.categoryForm.name }, { headers: this.authHeaders })
      : this.http.post(url, { name: this.categoryForm.name }, { headers: this.authHeaders });

    req.subscribe({
      next: () => { this.loadCategories(); this.closeCategoryModal(); },
      error: () => alert('Erro ao salvar categoria')
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('Excluir categoria?')) return;
    this.http.delete(`${this.api}/admin/categories/${id}`, { headers: this.authHeaders }).subscribe({
      next: () => this.loadCategories(),
      error: () => alert('Erro ao excluir categoria')
    });
  }
}