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

  isLoading    = true;
  errorMessage = '';

  activeTab: 'overview' | 'settings' = 'overview';

  activityLog: any[] = [];

  editForm = { username: '', email: '', bio: '', avatarUrl: '' };
  pwForm   = { current: '', new: '', confirm: '' };
  prefs    = { emailNotif: true, publicProfile: false, newsletter: false };

  savingProfile = false;
  saveSuccess   = false;
  saveError     = '';

  uploadingAvatar = false;
  avatarSuccess   = '';
  avatarError     = '';

  pwSuccess = false;
  pwError   = '';

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
    setTimeout(() => this.loadProfile(), 0);
  }

  loadProfile(): void {
    this.isLoading    = true;
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
        this.isLoading    = false;
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

  saveProfile(): void {
    if (!this.editForm.username.trim()) {
      this.saveError = 'O nome não pode estar vazio.';
      return;
    }

    this.savingProfile = true;
    this.saveSuccess   = false;
    this.saveError     = '';

    this.userService.updateName(this.editForm.username.trim()).subscribe({
      next: (res) => {
        if (this.user) this.user.name = res.data.name;
        this.editForm.username = res.data.name;
        this.savingProfile     = false;
        this.saveSuccess       = true;
        setTimeout(() => this.saveSuccess = false, 3000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.savingProfile = false;
        this.saveError     = err.error?.message || 'Erro ao salvar nome.';
        this.cdr.detectChanges();
      }
    });
  }

  calcDaysActive(createdAt: string): number {
    if (!createdAt) return 0;
    return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
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

  setTab(tab: typeof this.activeTab): void { this.activeTab = tab; }
  navigate(path: string): void { this.router.navigate([path]); }
  logout(): void { this.authService.logout(); }
  openEditModal(): void { this.setTab('settings'); }

  copyProfileLink(): void {
    const name = this.user?.name || 'user';
    navigator.clipboard.writeText(`${window.location.origin}/u/${name}`);
  }

  changePassword(): void {
    this.pwError   = '';
    this.pwSuccess = false;
    if (!this.pwForm.current || !this.pwForm.new || !this.pwForm.confirm) {
      this.pwError = 'Preencha todos os campos.';
      return;
    }
    if (this.pwForm.new !== this.pwForm.confirm) {
      this.pwError = 'As senhas não coincidem.';
      return;
    }
    if (this.pwStrength < 2) {
      this.pwError = 'Senha muito fraca.';
      return;
    }
    // TODO: this.userService.changePassword(this.pwForm).subscribe(...)
    this.pwSuccess = true;
    this.pwForm    = { current: '', new: '', confirm: '' };
    setTimeout(() => this.pwSuccess = false, 3000);
  }

  confirmDeleteAccount(): void {
    if (confirm('ATENÇÃO: Esta ação é irreversível. Confirma a exclusão da sua conta?')) {
      // TODO: this.userService.deleteAccount().subscribe(...)
    }
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/img/no-thumb.png';
  }
}
