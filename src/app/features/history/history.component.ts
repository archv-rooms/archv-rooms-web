import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { SessionService } from '../../core/services/session.service'

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  private router = inject(Router)
  private sessionService = inject(SessionService)
  private cdr = inject(ChangeDetectorRef)

  sessions: any[] = []
  loading = true
  error = false
  userName = ''

  ngOnInit() {
    this.checkAuth()
    this.sessionService.getHistory().subscribe({
      next: (res: any) => {
        this.sessions = res?.data?.sessions ?? []
        this.loading = false
        this.cdr.detectChanges()
      },
      error: () => {
        this.error = true
        this.loading = false
        this.cdr.detectChanges()
      }
    })
  }

  checkAuth(): void {
    const user = localStorage.getItem('@archv:user')
    if (user) {
      try {
        const parsed = JSON.parse(user)
        this.userName = parsed.name ?? parsed.email ?? 'USER'
      } catch {
        this.userName = 'USER'
      }
    }
  }

  logout(): void {
    localStorage.removeItem('@archv:token')
    localStorage.removeItem('@archv:user')
    this.router.navigate(['/'])
  }

  navigate(path: string): void {
    this.router.navigate([path])
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '—'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }
}