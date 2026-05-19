<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('delivered_by_user_id')->nullable()->after('delivery_proof')->constrained('users')->nullOnDelete();
        });

        Schema::table('returns', function (Blueprint $table) {
            $table->foreignId('processed_by_user_id')->nullable()->after('rejection_reason')->constrained('users')->nullOnDelete();
        });

        Schema::table('payrolls', function (Blueprint $table) {
            $table->foreignId('processed_by_user_id')->nullable()->after('rejection_reason')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('delivered_by_user_id');
        });

        Schema::table('returns', function (Blueprint $table) {
            $table->dropConstrainedForeignId('processed_by_user_id');
        });

        Schema::table('payrolls', function (Blueprint $table) {
            $table->dropConstrainedForeignId('processed_by_user_id');
        });
    }
};
