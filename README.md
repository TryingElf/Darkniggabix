# Darkniggabix — Mercat Clandestí

Projecte final de curs. Arquitectura de dues capes.

```
Darkniggabix/
├── backend/    ← API REST (Node.js + Express + SQLite)
└── frontend/   ← Botiga (Angular 21)
```

## Executar el projecte

### Backend (port 3000)
```bash
cd backend
npm install
npm start
```
Panell d'administració: `http://localhost:3000`

### Frontend (port 4200)
```bash
cd frontend
npm install
npx ng serve
```
Botiga: `http://localhost:4200`

> Els dos han d'estar corrent alhora.

## Tecnologies

| Capa | Tecnologia |
|------|-----------|
| Backend | Node.js + Express.js |
| Base de dades | SQLite3 |
| Frontend | Angular 21 (standalone, signals, HttpClient) |
| Accessibilitat | WCAG 2.1 Level AA |

## Endpoints API

| Mètode | Ruta | Descripció |
|--------|------|-----------|
| GET/POST/DELETE/PATCH | `/api/products/weapons` | Gestió d'armes |
| GET/POST/DELETE/PATCH | `/api/products/drugs` | Gestió de drogues |
| GET/POST/DELETE/PATCH | `/api/products/organs` | Gestió d'organs |
| GET/POST/DELETE | `/api/products/cart` | Carrito |
| POST | `/api/products/order` | Processar comanda |
| GET | `/api/products/orders` | Historial de comandes |
