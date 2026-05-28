# Darkniggabix — Mercat Clandestí

Projecte final de curs. Arquitectura de dues capes: backend REST API i frontend Angular.

---

## Estructura del repositori

```
Darkniggabix/                  ← BACKEND (aquesta carpeta)
├── app.js                     ← Servidor Express
├── db.js                      ← Connexió i inicialització SQLite
├── routes/products.js         ← API REST (armes, drogues, organs, carrito, comandes)
├── public/                    ← Panell d'administració (Vanilla JS)
│   ├── index.html
│   ├── app.js
│   └── stylesheets/style.css
└── darkniggabix-angular/      ← FRONTEND (Angular 21)
    ├── src/
    │   ├── app/
    │   │   ├── components/    ← Nav, ProductsSection, Cart, Notification
    │   │   ├── services/      ← ProductsService, CartService, NotificationService
    │   │   └── models/        ← Weapon, Drug, Organ, CartItem, OrderResult
    │   └── styles.css
    └── angular.json
```

---

## Com executar el projecte

### Backend (port 3000)
```bash
cd Darkniggabix
npm install
npm start
```
Panell d'administració: `http://localhost:3000`

### Frontend Angular (port 4200)
```bash
cd Darkniggabix/darkniggabix-angular
npm install
npx ng serve
```
Botiga: `http://localhost:4200`

---

## Tecnologies

| Capa | Tecnologia |
|------|-----------|
| Backend | Node.js + Express.js |
| Base de dades | SQLite3 |
| Frontend | Angular 21 (standalone components, signals, HttpClient) |
| Accessibilitat | WCAG 2.1 Level AA |

## Endpoints API REST

| Mètode | Ruta | Descripció |
|--------|------|-----------|
| GET | `/api/products/weapons` | Llista d'armes |
| POST | `/api/products/weapons` | Afegir arma |
| DELETE | `/api/products/weapons/:id` | Eliminar arma |
| PATCH | `/api/products/weapons/:id` | Actualitzar arma |
| GET | `/api/products/drugs` | Llista de drogues |
| POST | `/api/products/drugs` | Afegir droga |
| DELETE | `/api/products/drugs/:id` | Eliminar droga |
| PATCH | `/api/products/drugs/:id` | Actualitzar droga |
| GET | `/api/products/organs` | Llista d'organs |
| POST | `/api/products/organs` | Afegir organ |
| DELETE | `/api/products/organs/:id` | Eliminar organ |
| PATCH | `/api/products/organs/:id` | Actualitzar organ |
| GET | `/api/products/cart` | Contingut del carrito |
| POST | `/api/products/cart` | Afegir al carrito |
| DELETE | `/api/products/cart/:id` | Treure item del carrito |
| DELETE | `/api/products/cart` | Buidar carrito |
| POST | `/api/products/order` | Processar comanda (redueix estoc) |
| GET | `/api/products/orders` | Historial de comandes |
