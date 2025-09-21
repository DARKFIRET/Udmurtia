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
            $table->foreignId('route_id')->nullable(); // Remove constrained() for now
            $table->text('description')->nullable();
            $table->string('photo_path')->nullable();
            $table->integer('order')->nullable();
            $table->integer('day')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_points');
    }
};