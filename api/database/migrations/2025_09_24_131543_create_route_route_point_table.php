<?php

  use Illuminate\Database\Migrations\Migration;
  use Illuminate\Database\Schema\Blueprint;
  use Illuminate\Support\Facades\Schema;

  return new class extends Migration
  {
      public function up(): void
      {
          Schema::create('route_route_point', function (Blueprint $table) {
              $table->id();
              $table->foreignId('route_id')->constrained()->onDelete('cascade');
              $table->foreignId('route_point_id')->constrained()->onDelete('cascade');
              $table->timestamps();
          });
      }

      public function down(): void
      {
          Schema::dropIfExists('route_route_point');
      }
  };