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

### kdyz mam stare php
`cd .\backend\web-server\`

`npm install`

`composer install --ignore-platform-reqs`

`..\..\php-8.5.5\php.exe artisan serve`

### kdyz mam normalni php
`cd .\backend\web-server\`

`npm install`

`composer install`

`php artisan migrate`

`php artisan db:seed`

`php artisan serve`