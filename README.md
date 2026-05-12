# Quizo
Kahoot clone

# Matiasovy poznamky:
- stahnout si postman

## frontend
`cd .\frontend\`

`npm install`

`npm run dev`

## backend

### websocket-server
`cd .\backend\websocket-server`

`npm install`

`npm run dev`

### kdyz mam stare php nainstalovane v pc musim si stahnout novou verzi, prejmenovat ji na "php" a vlozit do slozky backend/web-server/
`cd .\backend\web-server\`

`npm install`

`composer install --ignore-platform-reqs`

`.\php\php.exe artisan migrate`

`.\php\php.exe artisan db:seed`

`.\php\php.exe artisan key:generate`

`.\php\php.exe artisan serve`

### kdyz mam nainstalovanou novou verzi (v tento moment 8.5.6) php
`cd .\backend\web-server\`

`npm install`

`composer install`

`php artisan migrate`

`php artisan db:seed`

`php artisan key:generate`

`php artisan serve`