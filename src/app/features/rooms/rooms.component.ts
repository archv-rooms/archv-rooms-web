import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Game {
  id: number;
  name: string;
  price: number;
  image: string;
  platform: 'PC' | 'PS5' | 'Xbox';
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent implements OnInit {

  search = '';
  platformFilter = '';

  games: Game[] = [
    {
      id: 1,
      name: 'Valorant',
      price: 0,
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/header.jpg',
      platform: 'PC'
    },
    {
      id: 2,
      name: 'CS2',
      price: 0,
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg',
      platform: 'PC'
    },
    {
      id: 3,
      name: 'League of Legends',
      price: 0,
      image: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg',
      platform: 'PC'
    },
    {
      id: 4,
      name: 'Fortnite',
      price: 0,
      image: 'https://cdn2.unrealengine.com/fortnite-chapter4-s4-1920x1080-2c9f0c0d4f5f.jpg',
      platform: 'PS5'
    },
    {
      id: 5,
      name: 'Minecraft',
      price: 99.90,
      image: 'https://www.minecraft.net/content/dam/minecraftnet/games/minecraft/key-art/MC_The-Wild-Update_1170x500.jpg',
      platform: 'Xbox'
    },
    {
      id: 6,
      name: 'GTA V',
      price: 89.90,
      image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg',
      platform: 'PC'
    },
    {
      id: 7,
      name: 'Spider-Man',
      price: 199.90,
      image: 'https://image.api.playstation.com/vulcan/ap/rnd/202207/1215/2V0b7F6x8d.jpg',
      platform: 'PS5'
    }
  ];

  get filteredGames(): Game[] {
    return this.games.filter(game =>
      game.name.toLowerCase().includes(this.search.toLowerCase()) &&
      (this.platformFilter === '' || game.platform === this.platformFilter)
    );
  }

  ngOnInit(): void {}
}