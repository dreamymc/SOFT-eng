# Use official PHP with Apache
FROM php:8.2-apache

# Install dependencies, including curl for Node.js
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    libpq-dev \
    libzip-dev \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip

# Enable Apache rewrite module
RUN a2enmod rewrite

# Set Apache document root and enable .htaccess rules (AllowOverride)
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf \
    && sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/apache2.conf \
    && sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Set working directory
WORKDIR /var/www/html

# Copy composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy Laravel app
COPY ./Tungal_Flower_Shop-master /var/www/html/

# NUKE ANY CACHED CONFIGS FROM LOCAL MACHINE
RUN rm -f bootstrap/cache/*.php

# Create all required Laravel directories explicitly
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    storage/app/public \
    bootstrap/cache \
    public/uploads

# Recreate the missing Laravel .htaccess file
RUN echo '<IfModule mod_rewrite.c>\n\
    <IfModule mod_negotiation.c>\n\
    Options -MultiViews -Indexes\n\
    </IfModule>\n\
    RewriteEngine On\n\
    # Handle Authorization Header\n\
    RewriteCond %{HTTP:Authorization} .\n\
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]\n\
    # Redirect Trailing Slashes If Not A Folder...\n\
    RewriteCond %{REQUEST_FILENAME} !-d\n\
    RewriteCond %{REQUEST_URI} (.+)/$\n\
    RewriteRule ^ %1 [L,R=301]\n\
    # Send Requests To Front Controller...\n\
    RewriteCond %{REQUEST_FILENAME} !-d\n\
    RewriteCond %{REQUEST_FILENAME} !-f\n\
    RewriteRule ^ index.php [L]\n\
    </IfModule>' > public/.htaccess

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies and build React/Inertia assets
RUN npm install && npm run build

# Create the storage symlink so images are publicly accessible
RUN php artisan storage:link

# Set Permissions
RUN chown -R www-data:www-data storage bootstrap/cache public/uploads public \
    && chmod -R 775 storage bootstrap/cache public/uploads public

# Expose Apache's actual default port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]