<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('bookings')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropForeign(['route_id']);
                $table->renameColumn('route_id', 'excursion_id');
                $table->foreign('excursion_id')->references('id')->on('excursions')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('bookings')) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropForeign(['excursion_id']);
                $table->renameColumn('excursion_id', 'route_id');
                $table->foreign('route_id')->references('id')->on('routes')->onDelete('cascade');
            });
        }
    }
};