# Tungal Flower Shop POS & Management System

Production Laravel/Inertia application for Tungal Flower Shop. The system handles POS checkout, product inventory, stock batches, sales history, invoices, delivery tracking, return/refund requests, employee records, payroll, approvals, and dashboard reporting.

## Repository Structure

The Laravel application is inside the nested app folder:

```text
SOFT-eng/
  Dockerfile
  .dockerignore
  .env.example
  .gitignore
  README.md
  Tungal_Flower_Shop-master/
    artisan
    composer.json
    package.json
    app/
    config/
    database/
    public/
    resources/
    routes/
```

Run Laravel, Composer, npm, and Artisan commands from:

```bash
cd Tungal_Flower_Shop-master
```

Root-level files are for repository and deployment support. The Dockerfile copies `Tungal_Flower_Shop-master/` into `/var/www/html` inside the container.

## Tech Stack

- Laravel 12
- PHP 8.2+
- MySQL
- React 19
- Inertia.js
- Vite
- Bootstrap 5
- Chart.js
- jsPDF / jsPDF AutoTable
- Render deployment with Docker
- Clever Cloud MySQL database

## Main Roles

- Owner
- Admin
- Manager
- Cashier
- Employee
- Delivery
- Customer

## Main Features

- POS cart and checkout
- Product catalog
- Product type/multiplier handling
- Product batch inventory
- Sales history and invoice receipts
- Shared delivery queue
- Delivery proof upload
- Return/refund requests
- Approval queue
- Payroll records
- Employee records and attendance
- Dashboard reports
- Weekly, monthly, yearly, and all-time sales PDF exports

## Local Setup

From the repository root:

```bash
cd Tungal_Flower_Shop-master
composer install
npm install
copy ..\.env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
```

Run the frontend dev server:

```bash
npm run dev
```

Run the Laravel server:

```bash
php artisan serve
```

Open:

```text
http://127.0.0.1:8000
```

## Production Environment Variables

Set production environment variables in the hosting provider dashboard. Local `.env` does not affect Render deployment.

Recommended production values:

```env
APP_NAME="Tungal Flower Shop"
APP_ENV=production
APP_KEY=base64:your_app_key
APP_DEBUG=false
APP_URL=https://your-render-url.onrender.com
APP_TIMEZONE=Asia/Manila

LOG_CHANNEL=stderr
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=your_mysql_host
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

BROADCAST_CONNECTION=log
CACHE_STORE=file
FILESYSTEM_DISK=public
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

MAIL_MAILER=log
VITE_APP_NAME="${APP_NAME}"
```

Use `CACHE_STORE=file` and `SESSION_DRIVER=file` unless the database has already been migrated with the required `cache` and `sessions` tables.

## Clever Cloud MySQL Mapping

Clever Cloud usually provides database credentials similar to:

```env
MYSQL_ADDON_HOST
MYSQL_ADDON_DB
MYSQL_ADDON_USER
MYSQL_ADDON_PASSWORD
MYSQL_ADDON_PORT
```

Map them into Laravel like this:

```env
DB_HOST=MYSQL_ADDON_HOST
DB_DATABASE=MYSQL_ADDON_DB
DB_USERNAME=MYSQL_ADDON_USER
DB_PASSWORD=MYSQL_ADDON_PASSWORD
DB_PORT=MYSQL_ADDON_PORT
```

Do not use the database username as the password unless Clever Cloud explicitly shows the same value for both.

## Render Deployment

This repository is intended to deploy from the repository root using the root Dockerfile.

Render settings:

```text
Environment: Docker
Root Directory: leave empty
Dockerfile Path: ./Dockerfile
```

The Dockerfile:

- installs PHP extensions,
- installs Node.js,
- copies `Tungal_Flower_Shop-master/` into `/var/www/html`,
- installs Composer dependencies,
- installs npm dependencies,
- builds Vite assets,
- creates the Laravel storage link,
- starts Apache.

The current Dockerfile does not automatically run migrations on container start.

## Database Migrations

Safe migration command:

```bash
php artisan migrate --force
```

This applies missing migrations without deleting existing data.

Danger commands:

```bash
php artisan migrate:fresh --force
php artisan migrate:refresh --force
php artisan db:wipe
```

These commands delete database tables/data. Only use them when intentionally resetting the database.

## Creating The First Admin

If the production database is empty, create one admin account after migrations.

From the Laravel app folder:

```bash
php artisan tinker
```

Then run:

```php
\App\Models\User::create([
    'firstname' => 'Admin',
    'lastname' => 'User',
    'contact_number' => '09123456789',
    'role' => 'Admin',
    'username' => 'admin',
    'password' => \Illuminate\Support\Facades\Hash::make('!Password123'),
]);
```

Change the password after first login.

## Storage

Uploaded product images, profile images, and proof images use Laravel public storage.

Run once per environment:

```bash
php artisan storage:link
```

The Dockerfile already runs this during image build.

## Build And Verification

Frontend production build:

```bash
npm run build
```

PHP tests:

```bash
php artisan test
```

Clear local Laravel caches:

```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

If `CACHE_STORE=database` and the database is unreachable, `php artisan cache:clear` can fail because it tries to clear the database cache table.

## Git Hygiene

Do not commit:

- `.env`
- `vendor/`
- `node_modules/`
- `public/build/`
- uploaded files in `storage/app/public/`
- logs and cached Laravel files

The root `.gitignore` is written for the nested Laravel app structure.

## Production Notes

- Render environment variables must be edited in the Render dashboard.
- Local `.env` changes do not affect the deployed Render service.
- `APP_DEBUG=false` must be used in production.
- Rotate database credentials if they were exposed publicly.
- Prefer `SESSION_DRIVER=file` and `CACHE_STORE=file` on Render unless database-backed sessions/cache are intentionally configured.
