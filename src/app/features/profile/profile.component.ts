import { Component, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService, UserProfile, Subscription } from '../../core/services/user.service';
import { environment } from '../../../environments/environments';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements AfterViewInit {

  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  user: UserProfile | null = null;
  activeSubscription: Subscription | null = null;

  userStats = {
    gamesInLibrary: 0,
    roomsAccessed:  0,
    daysActive:     0,
    signalLevel:    'NVL_00',
    signalPct:      0,
  };

  isLoading = true;
  errorMessage = '';

  activeTab: 'overview' | 'library' | 'activity' | 'settings' = 'overview';

  recentGames:   any[] = [];
  activityLog:   any[] = [];
  userLibrary:   any[] = [];
  libFilter      = 'all';
  loadingLibrary = false;

  activityHeatmap: { date: string; count: number; level: number }[] = [];
  fullActivityLog: any[] = [];

  editForm = { username: '', email: '', bio: '', location: '', avatarUrl: '' };
  pwForm   = { current: '', new: '', confirm: '' };
  prefs    = { emailNotif: true, publicProfile: false, newsletter: false };
  activeSessions: any[] = [];
  savingProfile  = false;
  saveSuccess    = false;

  uploadingAvatar = false;
  avatarSuccess   = '';
  avatarError     = '';

  get pwStrength(): number {
    const p = this.pwForm.new;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadProfile();
      this.buildHeatmap();
      this.loadMockActivity();
      this.loadMockSessions();
    }, 0);
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getProfile().subscribe({
      next: (response) => {
        this.user = response.data.user;
        if (this.user.subscriptions?.length > 0) {
          this.activeSubscription = this.user.subscriptions[0];
        }
        this.editForm = {
          username:  this.user.name  || '',
          email:     this.user.email || '',
          bio:       '',
          location:  '',
          avatarUrl: '',
        };
        this.userStats = {
          gamesInLibrary: 0,
          roomsAccessed:  0,
          daysActive:     this.calcDaysActive(this.user.createdAt),
          signalLevel:    this.activeSubscription
            ? 'NVL_0' + (this.activeSubscription.plan.accessLevel || 1)
            : 'NVL_00',
          signalPct: this.activeSubscription
            ? Math.min(this.activeSubscription.plan.accessLevel * 20, 100)
            : 5,
        };
        this.activityLog = [
          { type: 'sync', icon: '◈', text: 'Login registrado com sucesso',  time: 'AGORA' },
          { type: 'data', icon: '▸', text: 'Perfil carregado',              time: 'AGORA' },
          { type: 'info', icon: '▹', text: 'Sessão iniciada — ARCHV.ROOMS', time: 'AGORA' },
        ];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao carregar perfil.';
        this.cdr.detectChanges();
      }
    });
  }

  getAvatarUrl(): string {
    if (!this.user?.avatar) return '';
    if (this.user.avatar.startsWith('http')) return this.user.avatar;
    return `${environment.apiUrl}${this.user.avatar}`;
  }

  onAvatarFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingAvatar = true;
    this.avatarError     = '';
    this.avatarSuccess   = '';
    this.userService.updateAvatarFile(file).subscribe({
      next: (res) => {
        if (this.user) this.user.avatar = res.data.avatar;
        this.uploadingAvatar = false;
        this.avatarSuccess   = '▸ AVATAR ATUALIZADO';
        setTimeout(() => this.avatarSuccess = '', 3000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.uploadingAvatar = false;
        this.avatarError     = 'Erro ao enviar arquivo.';
        this.cdr.detectChanges();
      }
    });
  }

  saveAvatarUrl(): void {
    if (!this.editForm.avatarUrl) return;
    this.uploadingAvatar = true;
    this.avatarError     = '';
    this.avatarSuccess   = '';
    this.userService.updateAvatarUrl(this.editForm.avatarUrl).subscribe({
      next: (res) => {
        if (this.user) this.user.avatar = res.data.avatar;
        this.uploadingAvatar    = false;
        this.avatarSuccess      = '▸ AVATAR ATUALIZADO';
        this.editForm.avatarUrl = '';
        setTimeout(() => this.avatarSuccess = '', 3000);
        this.cdr.detectChanges();
      },
      error: () => {
        this.uploadingAvatar = false;
        this.avatarError     = 'URL inválida ou erro ao atualizar.';
        this.cdr.detectChanges();
      }
    });
  }

  calcDaysActive(createdAt: string): number {
    if (!createdAt) return 0;
    const diff = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  buildHeatmap(): void {
    const today = new Date();
    this.activityHeatmap = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const count = Math.floor(Math.random() * 8);
      return {
        date:  d.toLocaleDateString('pt-BR'),
        count,
        level: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4,
      };
    });
  }

  loadMockActivity(): void {
    this.fullActivityLog = [
      { timestamp: '10/05 17:52', type: 'sync', message: 'Sincronização de acervo concluída' },
      { timestamp: '10/05 15:20', type: 'info', message: 'Login registrado — Chromium / São Paulo, BR' },
      { timestamp: '09/05 22:11', type: 'warn', message: 'Tentativa de login de IP não reconhecido' },
      { timestamp: '09/05 18:05', type: 'data', message: 'Download: Super Mario World [SNES]' },
      { timestamp: '08/05 12:30', type: 'sync', message: 'Perfil atualizado com sucesso' },
    ];
  }

  loadMockSessions(): void {
    this.activeSessions = [
      { id: 'sess_001', device: 'CHROMIUM 131 / WINDOWS', location: 'São Paulo, BR',       lastSeen: 'AGORA',       isCurrent: true  },
      { id: 'sess_002', device: 'FIREFOX 124 / ANDROID',  location: 'Rio de Janeiro, BR',  lastSeen: 'HÁ 2 DIAS',   isCurrent: false },
    ];
  }

  getInitials(): string {
    const name = this.user?.name || this.authService.getUserName() || '??';
    return name.slice(0, 2).toUpperCase();
  }

  getPlanName(): string {
    return this.activeSubscription?.plan?.name || 'GRATUITO';
  }

  getPlanDesc(): string {
    const level = this.activeSubscription?.plan?.accessLevel || 0;
    if (level === 0) return '// Acesso básico ao arquivo público. Sem downloads.';
    if (level === 1) return '// Acesso ao acervo completo com downloads mensais.';
    return '// Acesso irrestrito. Downloads ilimitados. Custódio oficial.';
  }

  getPlanFeatures(): string[] {
    const plan = this.activeSubscription?.plan;
    if (!plan) return ['Acervo público (200 artefatos)', 'Sem downloads', 'Suporte básico'];
    return [
      `Acervo nível ${plan.accessLevel}`,
      `R$ ${plan.price}/mês`,
      plan.description || 'Acesso ao arquivo',
      'Suporte prioritário',
    ];
  }

  getPwLabel(): string {
    return ['FRACA', 'RAZOÁVEL', 'BOA', 'FORTE', 'EXCELENTE'][this.pwStrength] || '';
  }

  getFilteredLibrary(): any[] {
    if (this.libFilter === 'all') return this.userLibrary;
    return this.userLibrary.filter(g => g.console?.toLowerCase() === this.libFilter);
  }

  setTab(tab: typeof this.activeTab): void { this.activeTab = tab; }
  navigate(path: string): void { this.router.navigate([path]); }
  logout(): void { this.authService.logout(); }
  openEditModal(): void { this.setTab('settings'); }

  copyProfileLink(): void {
    const name = this.user?.name || 'user';
    const url = `${window.location.origin}/u/${name}`;
    navigator.clipboard.writeText(url);
  }

  saveProfile(): void {
    this.savingProfile = true;
    this.saveSuccess   = false;
    setTimeout(() => {
      this.savingProfile = false;
      this.saveSuccess   = true;
      setTimeout(() => this.saveSuccess = false, 3000);
    }, 800);
  }

  changePassword(): void {
    if (this.pwForm.new !== this.pwForm.confirm) {
      alert('As senhas não coincidem');
      return;
    }
  }

  revokeSession(id: string): void {
    this.activeSessions = this.activeSessions.filter(s => s.id !== id);
  }

  confirmDeleteAccount(): void {
    if (confirm('ATENÇÃO: Esta ação é irreversível. Confirma a exclusão da sua conta?')) {
      // TODO: this.userService.deleteAccount().subscribe(...)
    }
  }

  onGameClick(game: any): void {}

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/img/no-thumb.png';
  }
}