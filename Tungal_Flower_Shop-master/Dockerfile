# Use official PHP with Apache
FROM php:8.2-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    zip \
    libpq-dev \
    libzip-dev \
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

# Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader

# Permissions
RUN mkdir -p public/uploads \
    && chown -R www-data:www-data storage bootstrap/cache public/uploads \
    && chmod -R 775 storage bootstrap/cache public/uploads

# Expose Apache port
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]