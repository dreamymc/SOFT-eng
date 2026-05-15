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

# Enable Apache rewrite
RUN a2enmod rewrite

# Set Apache document root
RUN sed -i 's|/var/www/html|/var/www/html/public|g' \
    /etc/apache2/sites-available/000-default.conf \
    && sed -i 's|/var/www/html|/var/www/html/public|g' \
    /etc/apache2/apache2.conf

# Set working directory
WORKDIR /var/www/html

# Copy composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy Laravel app
COPY ./Tungal_Flower_Shop-master /var/www/html/

# Create all required Laravel directories explicitly
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    public/uploads

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies and build React/Inertia assets
RUN npm install && npm run build

# Set Permissions
RUN chown -R www-data:www-data storage bootstrap/cache public/uploads public \
    && chmod -R 775 storage bootstrap/cache public/uploads public

# Expose Apache's actual default port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]