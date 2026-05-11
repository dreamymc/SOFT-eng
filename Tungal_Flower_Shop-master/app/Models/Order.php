<?php

namespace App\Models;

use App\Models\User;
use App\Models\OrderDetail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        
        // --- INJECTED: Customer, Delivery, and Payment Tracking ---
        'customer_name',
        'customer_address',
        'order_type',
        'payment_method',
        'reference_number',
        
        'quantity',
        'total',
        'discount_percentage',
        'discount_amount',
        'cash_recieved', // Keeping your exact spelling from the controller
        'change',
        'order_status',
        'delivery_proof'
    ];

    // ==========================================
    // NEW RELATIONSHIPS ADDED FOR THE ADMIN DASHBOARD
    // ==========================================

    /**
     * Get all of the order details/items associated with the order.
     */
    public function details()
    {
        return $this->hasMany(OrderDetail::class, 'order_id');
    }

    /**
     * Get the user (employee/cashier) that handled the order.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}