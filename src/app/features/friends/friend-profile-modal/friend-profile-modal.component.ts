import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-friend-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './friend-profile-modal.component.html',
  styleUrls: ['./friend-profile-modal.component.scss']
})
export class FriendProfileModalComponent implements OnChanges {
  @Input() friend: any = null;
  @Input() activity: any = null;       // item de friendsActivity deste amigo
  @Input() allActivity: any[] = [];    // lista completa de friendsActivity

  @Output() close = new EventEmitter<void>();
  @Output() message = new EventEmitter<any>();
  @Output() remove = new EventEmitter<number>();

  status = '';
  recentGames: any[] = [];

  ngOnChanges(): void {
    if (!this.friend) return;

    // pega a atividade atual do amigo
    this.activity = this.allActivity.find(a => a.user?.id === this.friend.id) ?? null;
    this.status = this.activity?.status ?? 'inactive';

    // monta lista de jogos recentes (filtra apenas os com jogo definido)
    this.recentGames = this.allActivity
      .filter(a => a.user?.id === this.friend.id && a.game)
      .slice(0, 3);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }

  onMessage(): void {
    this.message.emit(this.friend);
    this.close.emit();
  }

  onRemove(): void {
    this.remove.emit(this.friend.friendshipId);
    this.close.emit();
  }

  timeSince(dateStr: string | null): string {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `há ${minutes}min`;
    const hours = Math.floor(diffMs / 3600000);
    if (hours < 24) return `há ${hours}h`;
    const days = Math.floor(hours / 24);
    return `há ${days}d`;
  }
}