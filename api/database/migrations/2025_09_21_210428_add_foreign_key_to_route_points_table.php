<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('route_points', function (Blueprint $table) {
            $table->foreign('route_id')->references('id')->on('routes')->onDelete('cascade')->change();
        });
    }

    public function down(): void
    {
        Schema::table('route_points', function (Blueprint $table) {
            $table->dropForeign(['route_id']);
        });
    }
};