<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('route_point_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained()->onDelete('cascade');
            $table->foreignId('route_point_id')->constrained()->onDelete('cascade');
            $table->integer('day')->nullable(); // День для конкретной точки в маршруте
            $table->timestamps();

            // Уникальность комбинации route_id, route_point_id и day
            $table->unique(['route_id', 'route_point_id', 'day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_point_days');
    }
};