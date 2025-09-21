<?php

  namespace Database\Seeders;

  use Illuminate\Database\Seeder;
  use App\Models\RoutePoint;

  class RoutePointSeeder extends Seeder
  {
      public function run(): void
      {
          RoutePoint::create([
              'route_id' => 1,
              'description' => 'Point 1 Description',
              'photo_path' => 'route_points/point1.jpg',
              'order' => 0,
          ]);
          RoutePoint::create([
              'route_id' => 1,
              'description' => 'Point 2 Description',
              'photo_path' => 'route_points/point2.jpg',
              'order' => 1,
          ]);
      }
  }