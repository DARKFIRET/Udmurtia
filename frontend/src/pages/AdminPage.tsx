import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CreateRoutePoint from "@/components/admin/CreateRoutePoint";
import CreateRoute from "@/components/admin/CreateRoute";
import CreateTour from "@/components/admin/CreateTour";
import EditSection from "@/components/admin/EditSection";

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Панель администратора</h1>
          <p className="text-gray-600 mt-2">Управление точками маршрутов, маршрутами и экскурсиями</p>
        </div>

        <Tabs defaultValue="points" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="points">Точки маршрута</TabsTrigger>
            <TabsTrigger value="routes">Маршруты</TabsTrigger>
            <TabsTrigger value="tours">Экскурсии</TabsTrigger>
            <TabsTrigger value="edit">Редактирование</TabsTrigger>
          </TabsList>

          <TabsContent value="points" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Создание точки маршрута</CardTitle>
                <CardDescription>
                  Добавьте новую точку маршрута с фотографией и названием
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateRoutePoint />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Создание маршрута</CardTitle>
                <CardDescription>
                  Создайте маршрут на основе существующих точек
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateRoute />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tours" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Создание экскурсии</CardTitle>
                <CardDescription>
                  Создайте экскурсию на основе существующего маршрута
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CreateTour />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Редактирование</CardTitle>
                <CardDescription>
                  Редактируйте существующие точки маршрутов, маршруты и экскурсии
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EditSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;