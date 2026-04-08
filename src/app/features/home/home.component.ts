import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  terminalLines: string[] = [];
  currentTyping: string = '';
  
  private messages: string[] = [
    'Loading Projeto X OS...',
    'Accessing Repository...',
    'System Ready. Insert Coin to Continue.'
  ];
  
  messageIndex = 0;
  private charIndex = 0;
  private typingInterval: any;

  plans = [
    {
      id: 1,
      name: 'Basic',
      icon: '🕹️', // Controle simples
      price: 'R$ 15,00',
      benefits: ['Acesso a jogos 8-bit', 'Suporte padrão', '1 tela simultânea'],
      buttonText: 'Start Basic'
    },
    {
      id: 2,
      name: 'Pro',
      icon: '📼', // Cartucho
      price: 'R$ 30,00',
      benefits: ['Acesso a jogos 16-bit', 'Suporte prioritário', 'Save na nuvem'],
      buttonText: 'Start Pro'
    },
    {
      id: 3,
      name: 'Ultimate',
      icon: '👑', // Coroa
      price: 'R$ 50,00',
      benefits: ['Acesso total (32-bit+)', 'Multiplayer online', 'Acesso antecipado'],
      buttonText: 'Start Ultimate'
    }
  ];

  ngOnInit(): void {
    this.startTypingEffect();
  }

  ngOnDestroy(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }

  private startTypingEffect(): void {
    this.typingInterval = setInterval(() => {
      if (this.messageIndex < this.messages.length) {
        const currentMessage = this.messages[this.messageIndex];
        
        if (this.charIndex < currentMessage.length) {
          this.currentTyping += currentMessage.charAt(this.charIndex);
          this.charIndex++;
        } else {
          this.terminalLines.push(this.currentTyping);
          this.currentTyping = '';
          this.charIndex = 0;
          this.messageIndex++;
          
          // Pausa entre as linhas
          clearInterval(this.typingInterval);
          setTimeout(() => this.startTypingEffect(), 800);
        }
      } else {
        clearInterval(this.typingInterval);
      }
    }, 50); // Velocidade da digitação
  }
}
