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
  selectedImage: File | null = null;
  selectedRoom: File | null = null;

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
  editingPlan = false;
  planForm: any = { id: null, name: '', description: '', price: 0, accessLevel: 1 };

  // CATEGORIES
  categories: any[] = [];
  showCategoryModal = false;
  editingCategory = false;
  categoryForm: any = { name: '' };

  // ── BAN ──────────────────────────────────────────────────────
  showBanModal = false;

  banForm: {
    userId: number | null;
    userName: string;
    userEmail: string;
    type: 'temporary' | 'permanent';
    durationHours: number;
    reason: string;
  } = {
    userId: null,
    userName: '',
    userEmail: '',
    type: 'temporary',
    durationHours: 24,
    reason: ''
  };

  readonly banDurationPresets = [
    { label: '1H',   hours: 1   },
    { label: '6H',   hours: 6   },
    { label: '12H',  hours: 12  },
    { label: '24H',  hours: 24  },
    { label: '3D',   hours: 72  },
    { label: '7D',   hours: 168 },
    { label: '30D',  hours: 720 },
  ];

  readonly banReasonPresets = [
    'Spam',
    'Conteúdo impróprio',
    'Abuso de sistema',
    'Pirataria',
    'Múltiplas contas',
    'Violação de TOS',
  ];

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

  if (game) {
    // mapeia valores antigos para os novos
    const platformMap: Record<string, string> = {
      'MD': 'MEGA DRIVE',
      'GB': 'GAME BOY',
    };
    const platform = platformMap[game.console] ?? game.console;
    this.gameForm = { ...game, platform };
  } else {
    this.gameForm = { title: '', platform: 'NES', coverUrl: '', accessLevel: 1, planId: null };
  }

  this.selectedImage = null;
  this.selectedRoom = null;
  this.cdr.detectChanges();
}

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedImage = input.files?.[0] ?? null;
  }

  onRoomSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedRoom = input.files?.[0] ?? null;
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
    const payload: any = {
      title: this.gameForm.title,
      platform: this.gameForm.platform,
      accessLevel: this.gameForm.accessLevel,
    };

    // só manda coverUrl se o usuário digitou uma URL nova
    if (this.gameForm.coverUrl && this.gameForm.coverUrl !== this.gameForm.image) {
      payload.coverUrl = this.gameForm.coverUrl;
    }

    this.gameService.updateGame(this.gameForm.id, payload).subscribe({
      next: (res) => {
        const id = res.data?.id ?? this.gameForm.id;
        this.uploadGameFiles(id, () => { this.loadGames(); this.closeGameModal(); });
      },
      error: () => alert('Erro ao atualizar jogo')
    });
  } else {
    this.gameService.createGame(this.gameForm).subscribe({
      next: (res) => {
        const id = res.data?.id;
        if (!id) { this.loadGames(); this.closeGameModal(); return; }
        this.uploadGameFiles(id, () => { this.loadGames(); this.closeGameModal(); });
      },
      error: () => alert('Erro ao criar jogo')
    });
  }
}
  private uploadGameFiles(gameId: number, onDone: () => void): void {
    const uploads: Promise<void>[] = [];

    if (this.selectedImage) {
      const fd = new FormData();
      fd.append('image', this.selectedImage);
      uploads.push(
        this.http.patch(`${this.api}/games/${gameId}/image`, fd, {
          headers: { Authorization: `Bearer ${this.authService.getToken()}` }
        }).toPromise().then(() => {})
      );
    }

    if (this.selectedRoom) {
      const fd = new FormData();
      fd.append('file', this.selectedRoom);
      uploads.push(
        this.http.patch(`${this.api}/games/${gameId}/file`, fd, {
          headers: { Authorization: `Bearer ${this.authService.getToken()}` }
        }).toPromise().then(() => {})
      );
    }

    Promise.all(uploads)
      .then(onDone)
      .catch(() => { alert('Jogo salvo, mas erro no upload dos arquivos.'); onDone(); });
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
        this.userStats.total      = res.data.length;
        this.userStats.online     = 0;
        this.userStats.banned     = res.data.filter((u: any) => u.role === 'banned').length;
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

  promoteToAdmin(user: any): void {
    if (!confirm(`Promover "${user.name}" a administrador?`)) return;
    this.http.patch(`${this.api}/admin/users/${user.id}/role`, { role: 'admin' }, { headers: this.authHeaders }).subscribe({
      next: () => { user.role = 'admin'; this.cdr.detectChanges(); },
      error: () => alert('Erro ao promover usuário')
    });
  }

  demoteFromAdmin(user: any): void {
    if (!confirm(`Revogar cargo de admin de "${user.name}"? Ele voltará a ser um usuário comum.`)) return;
    this.http.patch(`${this.api}/admin/users/${user.id}/role`, { role: 'user' }, { headers: this.authHeaders }).subscribe({
      next: () => { user.role = 'user'; this.cdr.detectChanges(); },
      error: () => alert('Erro ao revogar cargo de admin')
    });
  }

  // ── SUBSCRIPTION MODAL ────────────────────────────────────
  showSubscriptionModal = false;
  subscriptionTarget: any = null;
  grantPlanId: number | null = null;
  grantDurationDays = 30;

  openSubscriptionModal(user: any): void {
    this.subscriptionTarget = user;
    this.grantPlanId = null;
    this.grantDurationDays = 30;
    this.showSubscriptionModal = true;
    this.cdr.detectChanges();
  }

  closeSubscriptionModal(): void {
    this.showSubscriptionModal = false;
    this.subscriptionTarget = null;
    this.cdr.detectChanges();
  }

  grantPlan(): void {
    if (!this.grantPlanId || !this.subscriptionTarget) return;
    const payload = { planId: this.grantPlanId, durationDays: this.grantDurationDays };
    this.http.post(`${this.api}/admin/users/${this.subscriptionTarget.id}/grant-plan`, payload, { headers: this.authHeaders }).subscribe({
      next: (res: any) => {
        const plan = this.plans.find(p => p.id === this.grantPlanId);
        this.subscriptionTarget.subscription = {
          plan,
          status: 'active',
          createdAt: new Date().toISOString(),
          ...(res?.data ?? {})
        };
        this.cdr.detectChanges();
        alert(`Plano "${plan?.name}" concedido com sucesso!`);
      },
      error: (err) => alert(err.error?.message || 'Erro ao conceder plano')
    });
  }

  // ── BAN ───────────────────────────────────────────────────
  openBanModal(user: any): void {
    this.banForm = {
      userId:        user.id,
      userName:      user.name,
      userEmail:     user.email,
      type:          'temporary',
      durationHours: 24,
      reason:        ''
    };
    this.showBanModal = true;
    this.cdr.detectChanges();
  }

  closeBanModal(): void {
    this.showBanModal = false;
    this.cdr.detectChanges();
  }

  confirmBan(): void {
    if (!this.banForm.reason.trim()) return;

    const payload: any = {
      type:   this.banForm.type,
      reason: this.banForm.reason,
      ...(this.banForm.type === 'temporary' && { durationHours: this.banForm.durationHours })
    };

    this.http
      .post(`${this.api}/admin/users/${this.banForm.userId}/ban`, payload, { headers: this.authHeaders })
      .subscribe({
        next: () => {
          const target = this.users.find(u => u.id === this.banForm.userId);
          if (target) target.role = 'banned';
          this.filteredUsers = [...this.filteredUsers];
          this.userStats.banned = this.users.filter(u => u.role === 'banned').length;
          this.closeBanModal();
          this.cdr.detectChanges();
        },
        error: (err) => alert(err.error?.message || 'Erro ao executar ban')
      });
  }

  unbanUser(user: any): void {
    if (!confirm(`Remover ban de ${user.name}?`)) return;
    this.http
      .post(`${this.api}/admin/users/${user.id}/unban`, {}, { headers: this.authHeaders })
      .subscribe({
        next: () => {
          user.role = 'user';
          this.userStats.banned = this.users.filter(u => u.role === 'banned').length;
          this.filteredUsers = [...this.filteredUsers];
          this.cdr.detectChanges();
        },
        error: (err) => alert(err.error?.message || 'Erro ao remover ban')
      });
  }

  // ── SALES ─────────────────────────────────────────────────
  loadSales(): void {
    this.http.get<any>(`${this.api}/admin/sales`, { headers: this.authHeaders }).subscribe({
      next: (res) => {
        this.sales = res.data;
        this.salesStats.total   = res.data.length;
        this.salesStats.active  = res.data.filter((s: any) => s.status === 'active').length;
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

  openPlanModal(plan?: any): void {
    this.showPlanModal = true;
    this.editingPlan = !!plan;
    this.planForm = plan
      ? { ...plan }
      : { id: null, name: '', description: '', price: 0, accessLevel: 1 };
    this.cdr.detectChanges();
  }

  closePlanModal(): void {
    this.showPlanModal = false;
    this.cdr.detectChanges();
  }

  savePlan(): void {
    if (this.editingPlan) {
      this.http.put(`${this.api}/admin/plans/${this.planForm.id}`, {
        name:        this.planForm.name,
        price:       Number(this.planForm.price),
        description: this.planForm.description,
        accessLevel: Number(this.planForm.accessLevel)
      }, { headers: this.authHeaders }).subscribe({
        next: () => { this.loadPlans(); this.closePlanModal(); },
        error: () => alert('Erro ao salvar plano')
      });
    } else {
      this.http.post(`${this.api}/admin/plans`, {
        name:        this.planForm.name,
        price:       Number(this.planForm.price),
        description: this.planForm.description,
        accessLevel: Number(this.planForm.accessLevel)
      }, { headers: this.authHeaders }).subscribe({
        next: () => { this.loadPlans(); this.closePlanModal(); },
        error: (err) => alert(err.error?.message || 'Erro ao criar plano')
      });
    }
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