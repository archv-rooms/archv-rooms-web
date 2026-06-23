// error.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service'; // ajuste o caminho conforme seu projeto

// Mapa de códigos de erro → título + descrição
const ERROR_MAP: Record<number, { title: string; desc: string }> = {
  400: {
    title: 'REQUISIÇÃO INVÁLIDA',
    desc:  'O sinal enviado está corrompido ou malformado. Verifique os parâmetros e tente novamente.',
  },
  401: {
    title: 'ACESSO NÃO AUTORIZADO',
    desc:  'Credenciais ausentes ou inválidas. Inicialize sua sessão para acessar este artefato.',
  },
  403: {
    title: 'ACESSO NEGADO',
    desc:  'Você não tem permissão para acessar este setor do arquivo. Verifique seu nível de acesso.',
  },
  404: {
    title: 'ARTEFATO NÃO ENCONTRADO',
    desc:  'O sinal que você buscou não existe neste arquivo. O artefato pode ter sido movido ou deletado.',
  },
  500: {
    title: 'FALHA INTERNA DO SERVIDOR',
    desc:  'Um erro inesperado ocorreu nos sistemas ARCHV. Nossa equipe já foi notificada. Tente novamente em breve.',
  },
  503: {
    title: 'SERVIÇO INDISPONÍVEL',
    desc:  'Os sistemas ARCHV estão temporariamente offline para manutenção. Aguarde o restabelecimento do sinal.',
  },
};

const DEFAULT_ERROR = {
  title: 'ERRO DESCONHECIDO',
  desc:  'Um erro inesperado interrompeu o sinal. Tente voltar ao início ou aguarde.',
};

@Component({
  selector:    'app-error',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './error.component.html',
  styleUrls:   ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {

  private authService = inject(AuthService);

  errorCode   = 0;
  errorTitle  = '';
  errorDesc   = '';
  currentPath = '';
  timestamp   = '';
  isLoggedIn  = false;
  isAdmin     = false;

  constructor(
    private router: Router,
    private route:  ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // Aceita o código via queryParam (?code=404) ou route data ({ data: { code: 404 } })
    const paramCode = this.route.snapshot.queryParamMap.get('code');
    const dataCode  = this.route.snapshot.data?.['code'];

    this.errorCode = Number(paramCode ?? dataCode ?? 0);

    const entry = ERROR_MAP[this.errorCode] ?? DEFAULT_ERROR;
    this.errorTitle = entry.title;
    this.errorDesc  = entry.desc;

    this.currentPath = window.location.pathname;
    this.timestamp   = new Date().toISOString().replace('T', ' ').split('.')[0];

    this.isLoggedIn = this.authService.isAuthenticated();
    this.isAdmin    = this.authService.isAdmin();
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  goBack(): void {
    window.history.back();
  }
}