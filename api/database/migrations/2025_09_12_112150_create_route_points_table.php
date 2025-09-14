<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('route_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained()->onDelete('cascade'); // Связь с маршрутом
            $table->text('description')->nullable(); // Описание точки
            $table->string('photo_path')->nullable(); // Путь к фото
            $table->integer('order')->default(0); // Порядок точки в маршруте
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_points');
    }
};