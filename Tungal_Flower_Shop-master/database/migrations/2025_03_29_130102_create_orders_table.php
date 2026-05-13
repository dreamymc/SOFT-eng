<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            
            // --- INJECTED: Customer, Delivery, and Payment Tracking ---
            $table->string('customer_name')->nullable();
            $table->string('customer_address')->nullable();
            $table->string('order_type')->default('Walk-in');
            $table->string('payment_method')->default('Cash');
            $table->string('reference_number')->nullable();
            
            $table->integer('quantity');
            $table->decimal('total',10,2);
            $table->decimal('discount_percentage', 5, 2)->nullable();
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('cash_recieved',10,2);
            $table->decimal('change',10,2);
            
            // Updated default to reflect our new strict status workflow
            $table->string('order_status')->default('Completed - Shop');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};