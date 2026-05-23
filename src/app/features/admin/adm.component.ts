import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-adm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './adm.component.html',
  styleUrls: ['./adm.component.scss']
})
export class AdmComponent implements OnInit {

  private gameService = inject(GameService);
  private http        = inject(HttpClient);
  private authService = inject(AuthService);
  private cdr         = inject(ChangeDetectorRef);
  private router      = inject(Router);
  private api         = environment.apiUrl;

  currentSection = 'games';
  errorMessage = '';

  // GAMES
  games: any[] = [];
  filteredGames: any[] = [];
  gameSearch = '';
  gamePlatformFilter = '';
  showGameModal = false;
  editingGame = false;
  gameForm: any = { title: '', platform: 'NES', coverUrl: '', accessLevel: 1, planId: null };

  // USERS
  users: any[] = [];
  filteredUsers: any[] = [];
  userSearch = '';
  userStats = { total: 0, online: 0, banned: 0, newLast24h: 0 };

  // SALES
  sales: any[] = [];
  salesStats = { total: 0, active: 0, revenue: 0 };

  // PLANS
  plans: any[] = [];
  showPlanModal = false;
  planForm: any = { id: null, name: '', description: '', price: 0, accessLevel: 0 };

  // CATEGORIES
  categories: any[] = [];
  showCategoryModal = false;
  editingCategory = false;
  categoryForm: any = { name: '' };

  ngOnInit(): void {
    this.loadGames();
    this.loadUsers();
    this.loadSales();
    this.loadPlans();
    this.loadCategories();
  }

  private get authHeaders() {
    return { Authorization: `Bearer ${this.authService.getToken()}` };
  }

  // ── NAVEGAÇÃO ─────────────────────────────────────────────
  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  // ── GAMES ─────────────────────────────────────────────────
  loadGames(): void {
    this.gameService.getGames().subscribe({
      next: (res) => {
        this.games = res.data;
        this.filteredGames = res.data;
        this.cdr.detectChanges();
      },
      error: () => { this.errorMessage = 'Erro ao carregar jogos'; this.cdr.detectChanges(); }
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
    this.gameForm = game
      ? { ...game, platform: game.console }
      : { title: '', platform: 'NES', coverUrl: '', accessLevel: 1, planId: null };
    this.cdr.detectChanges();
  }

  closeGameModal(): void {
    this.showGameModal = false;
    this.cdr.detectChanges();
  }

  changeSection(section: string): void {
    this.currentSection = section;
    this.cdr.detectChanges();
  }

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

  deleteGame(id: number): void {
    if (!confirm('Excluir este jogo?')) return;
    this.gameService.deleteGame(id).subscribe({
      next: () => { this.loadGames(); this.cdr.detectChanges(); },
      error: () => alert('Erro ao excluir jogo')
    });
  }

  // ── USERS ─────────────────────────────────────────────────
  loadUsers(): void {
    this.http.get<any>(`${this.api}/admin/users`, { headers: this.authHeaders }).subscribe({
      next: (res) => {
        this.users = res.data;
        this.filteredUsers = res.data;
        const h24atras = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.userStats.total = res.data.length;
        this.userStats.online = 0;
        this.userStats.banned = res.data.filter((u: any) => u.role === 'banned').length;
        this.userStats.newLast24h = res.data.filter((u: any) => new Date(u.createdAt) >= h24atras).length;
        this.cdr.detectChanges();
      },
      error: () => { this.errorMessage = 'Erro ao carregar usuários'; this.cdr.detectChanges(); }
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
      next: () => { user.role = novoRole; this.cdr.detectChanges(); },
      error: () => alert('Erro ao alterar role')
    });
  }

  // ── SALES ─────────────────────────────────────────────────
  loadSales(): void {
    this.http.get<any>(`${this.api}/admin/sales`, { headers: this.authHeaders }).subscribe({
      next: (res) => {
        this.sales = res.data;
        this.salesStats.total = res.data.length;
        this.salesStats.active = res.data.filter((s: any) => s.status === 'active').length;
        this.salesStats.revenue = res.data
          .filter((s: any) => s.status === 'active')
          .reduce((acc: number, s: any) => acc + (s.plan?.price ?? 0), 0);
        this.cdr.detectChanges();
      },
      error: () => { this.errorMessage = 'Erro ao carregar vendas'; this.cdr.detectChanges(); }
    });
  }

  cancelSale(id: number): void {
    if (!confirm('Cancelar esta assinatura?')) return;
    this.http.patch(`${this.api}/admin/sales/${id}/cancel`, {}, { headers: this.authHeaders }).subscribe({
      next: () => { this.loadSales(); this.cdr.detectChanges(); },
      error: (err) => alert(err.error?.message || 'Erro ao cancelar assinatura')
    });
  }

  // ── PLANS ─────────────────────────────────────────────────
  loadPlans(): void {
    this.http.get<any>(`${this.api}/admin/plans`, { headers: this.authHeaders }).subscribe({
      next: (res) => { this.plans = res.data; this.cdr.detectChanges(); },
      error: () => { this.errorMessage = 'Erro ao carregar planos'; this.cdr.detectChanges(); }
    });
  }

  openPlanModal(plan: any): void {
    this.showPlanModal = true;
    this.planForm = { ...plan };
    this.cdr.detectChanges();
  }

  closePlanModal(): void {
    this.showPlanModal = false;
    this.cdr.detectChanges();
  }

  savePlan(): void {
    this.http.put(`${this.api}/admin/plans/${this.planForm.id}`, {
      name: this.planForm.name,
      price: Number(this.planForm.price),
      description: this.planForm.description
    }, { headers: this.authHeaders }).subscribe({
      next: () => { this.loadPlans(); this.closePlanModal(); },
      error: () => alert('Erro ao salvar plano')
    });
  }

  deletePlan(id: number): void {
    if (!confirm('Deletar este plano? Só é possível se não houver assinaturas ativas.')) return;
    this.http.delete(`${this.api}/admin/plans/${id}`, { headers: this.authHeaders }).subscribe({
      next: () => { this.loadPlans(); this.cdr.detectChanges(); },
      error: (err) => alert(err.error?.message || 'Erro ao deletar plano')
    });
  }

  // ── CATEGORIES ────────────────────────────────────────────
  loadCategories(): void {
    this.http.get<any>(`${this.api}/admin/categories`, { headers: this.authHeaders }).subscribe({
      next: (res) => { this.categories = res.data; this.cdr.detectChanges(); },
      error: () => { this.errorMessage = 'Erro ao carregar categorias'; this.cdr.detectChanges(); }
    });
  }

  openCategoryModal(cat?: any): void {
    this.showCategoryModal = true;
    this.editingCategory = !!cat;
    this.categoryForm = cat ? { ...cat } : { name: '' };
    this.cdr.detectChanges();
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.cdr.detectChanges();
  }

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
      next: () => { this.loadCategories(); this.cdr.detectChanges(); },
      error: () => alert('Erro ao excluir categoria')
    });
  }
}