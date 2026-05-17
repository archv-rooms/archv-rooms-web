# Archv.rooms — Frontend

Plataforma de acesso a jogos retro por assinatura. Desenvolvida com Angular + Node.js + Prisma + MySQL.

## 🌐 URLs de Produção

| Serviço | URL |
|---|---|
| Frontend | `https://COLOCAR-URL-VERCEL-AQUI` |
| Backend | `https://archv-rooms.onrender.com` |

## 🔑 Credenciais de Teste

| Perfil | Email | Senha |
|---|---|---|
| Usuário comum | `teste@teste.com` | `123456` |
| Administrador | `admin@teste.com` | `123456` |

> ⚠️ As credenciais acima são para o ambiente de testes. Não use em produção.

## 🗺️ Mapa de Navegação

### Rotas públicas
- `/` — Home com vitrine de jogos
- `/login` — Login
- `/register` — Cadastro
- `/pricing` — Planos e preços

### Rotas autenticadas (usuário logado)
- `/library` — Biblioteca de jogos do usuário
- `/rooms/:id` — Sala de jogo
- `/profile` — Perfil do usuário
- `/checkout/:planId` — Checkout de plano

### Rotas administrativas (apenas admin)
- `/admin` — Painel de administração
  - **Games:** listar, criar, editar e excluir jogos
  - **Users:** listar usuários e alterar roles
  - **Categories:** CRUD de categorias

## 🚀 Rodando Localmente

### Frontend
```bash
npm install
ng serve
```
Acesse: `http://localhost:4200`

### Backend
```bash
npm install
node src/server.js
```
API disponível em: `http://localhost:3000`

### Banco de dados
```bash
npx prisma migrate dev
npx prisma studio
```

## 🛠️ Stack

- **Frontend:** Angular 21
- **Backend:** Node.js + Express
- **ORM:** Prisma
- **Banco:** MySQL (Aiven) / SQLite (local)
- **Deploy:** Vercel (frontend) + Render (backend)