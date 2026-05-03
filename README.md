# Quizo
Kahoot clone

# Matiasovy poznamky:
- stahnout si postman

## frontend
`cd .\frontend\`

`npm install`

`npm run dev`

## backend

### kdyz mam stare php
`cd .\backend\web-server\`

`composer install --ignore-platform-reqs`

`php artisan key:generate`

`..\..\php-8.5.5\php.exe artisan serve`

### kdyz mam normalni php
`cd .\backend\web-server\`

`composer install`

`php artisan key:generate`

`php artisan serve`