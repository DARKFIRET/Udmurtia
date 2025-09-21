<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('excursions', function (Blueprint $table) {
            $table->id();
            $table->string('start_point'); // Точка старта
            $table->date('start_date'); // Дата начала
            $table->time('start_time'); // Время начала
            $table->integer('all_days'); // Общее количество дней
            $table->integer('all_people'); // Общее количество людей
            $table->integer('age_limit'); // Ограничение по возрасту
            $table->foreignId('route_id')->constrained()->onDelete('cascade'); // Связь с маршрутом
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('excursions');
    }
};