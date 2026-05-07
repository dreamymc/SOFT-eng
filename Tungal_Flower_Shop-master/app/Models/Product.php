<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_name',
        'description',
        'price',
        'stocks', 
        'image',
    ];

    /**
     * Get all types associated with this product.
     */
    public function types()
    {
        return $this->hasMany(ProductType::class); 
    }

    /**
     * Get all batches for this product.
     */
    public function batches()
    {
        return $this->hasMany(ProductBatch::class);
    }

    /**
     * Get all order details associated with this product for sales tracking.
     */
    public function orderDetails()
    {
        return $this->hasMany(OrderDetail::class);
    }

    /**
     * Calculate the actual available stock from active batches.
     */
    public function calculateActiveStock()
    {
        return $this->batches()->where('status', 'active')->sum('quantity');
    }

    // ==========================================
    // GLOBAL OVERRIDE FOR CASHIER POV & CART
    // ==========================================
    // This intercepts ANY request for the old 'stocks' column
    // and automatically replaces it with the real batch total.
    // Zero React changes required.
    public function getStocksAttribute($value)
    {
        // If the controller already loaded batches, do the math in memory (fast)
        if ($this->relationLoaded('batches')) {
            return $this->batches->where('status', 'active')->sum('quantity');
        }
        
        // Otherwise, query the database dynamically
        return $this->calculateActiveStock();
    }
}