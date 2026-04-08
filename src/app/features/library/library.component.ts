import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LibraryService, Game } from '../../core/services/library.service';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  private libraryService = inject(LibraryService);

  games: Game[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  needsSubscription: boolean = false;

  ngOnInit(): void {
    this.loadLibrary();
  }

  loadLibrary(): void {
    this.libraryService.getGames().subscribe({
      next: (response) => {
        this.games = response.data.games;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 403) {
          this.needsSubscription = true;
          this.errorMessage = 'ACCESS DENIED: ACTIVE SUBSCRIPTION REQUIRED.';
        } else {
          this.errorMessage = err.error?.message || 'ERROR CONNECTING TO REPOSITORY.';
        }
      }
    });
  }
}