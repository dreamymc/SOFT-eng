<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReturnRequest extends Model
{
    use HasFactory;

    // Explicitly declare the table since the model name is different
    protected $table = 'returns';

    protected $fillable = [
        'order_id',
        'user_id',
        'reason',
        'refund_method',
        'status',
        'rejection_reason',
        'processed_by_user_id'
    ];

    // Links to the Order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Links to the Cashier who processed it
    public function cashier()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function processedBy()
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }
}
