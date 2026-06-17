import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SessionService } from '../../core/services/session.service'

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  sessions: any[] = []
  loading = true
  error = false

  constructor(private sessionService: SessionService) {}

 ngOnInit() {
  this.sessionService.getHistory().subscribe({
    next: (res: any) => {
      this.sessions = res?.data?.sessions ?? []
      this.loading = false
    },
    error: () => {
      this.error = true
      this.loading = false
    },
    complete: () => {
      this.loading = false
    }
  })
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