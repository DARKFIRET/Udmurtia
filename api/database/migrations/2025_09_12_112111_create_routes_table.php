<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Кто создал маршрут
            $table->string('start_location'); // Место старта
            $table->date('start_date'); // Дата начала
            $table->time('start_time'); // Время начала
            $table->integer('days'); // Количество дней
            $table->integer('slots'); // Количество мест
            $table->integer('age_restriction'); // Возрастное ограничение
            $table->decimal('cost', 8, 2); // Стоимость участия
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};