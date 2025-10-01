import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search } from "lucide-react";
import EditRoutePointForm from "./EditRoutePointForm";
import EditRouteForm from "./EditRouteForm";
import EditTourForm from "./EditTourForm";

// Моковые данные
const mockRoutePoints = [
  { id: "1", name: "Ижевский пруд", photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
  { id: "2", name: "Музей Калашникова", photo: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&q=80" },
  { id: "3", name: "Архитектурно-этнографический музей", photo: "https://images.unsplash.com/photo-1564399580075-5dfe19c205f3?w=400&q=80" },
];

const mockRoutes = [
  { id: "1", name: "Исторический центр Ижевска", description: "Знакомство с историческим центром города", pointsCount: 3 },
  { id: "2", name: "Природные красоты Удмуртии", description: "Путешествие по природным достопримечательностям", pointsCount: 5 },
];

const mockTours = [
  { id: "1", routeName: "Исторический центр Ижевска", startDate: "2024-03-15", price: 2500, participants: 15 },
  { id: "2", routeName: "Природные красоты Удмуртии", startDate: "2024-03-20", price: 3500, participants: 12 },
];

const EditSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<{type: string, id: string} | null>(null);

  const handleEdit = (type: string, id: string) => {
    setEditingItem({ type, id });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleDelete = (type: string, id: string) => {
    if (confirm(`Вы уверены, что хотите удалить этот ${type}?`)) {
      console.log(`Удаление ${type} с ID: ${id}`);
    }
  };

  if (editingItem) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Редактирование {editingItem.type === 'point' ? 'точки маршрута' : 
                           editingItem.type === 'route' ? 'маршрута' : 'экскурсии'}
          </h3>
          <Button variant="outline" onClick={handleCancelEdit}>
            Отмена
          </Button>
        </div>
        
        {editingItem.type === 'point' && <EditRoutePointForm pointId={editingItem.id} onCancel={handleCancelEdit} />}
        {editingItem.type === 'route' && <EditRouteForm routeId={editingItem.id} onCancel={handleCancelEdit} />}
        {editingItem.type === 'tour' && <EditTourForm tourId={editingItem.id} onCancel={handleCancelEdit} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Поиск..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="points" className="w-full">
        <TabsList>
          <TabsTrigger value="points">Точки маршрута</TabsTrigger>
          <TabsTrigger value="routes">Маршруты</TabsTrigger>
          <TabsTrigger value="tours">Экскурсии</TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="mt-6">
          <div className="grid gap-4">
            {mockRoutePoints
              .filter(point => point.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((point) => (
                <Card key={point.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={point.photo} 
                        alt={point.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{point.name}</h4>
                        <p className="text-sm text-gray-500">ID: {point.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit('point', point.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete('точку маршрута', point.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="routes" className="mt-6">
          <div className="grid gap-4">
            {mockRoutes
              .filter(route => route.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((route) => (
                <Card key={route.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{route.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{route.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{route.pointsCount} точек</Badge>
                          <span className="text-sm text-gray-500">ID: {route.id}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit('route', route.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete('маршрут', route.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="tours" className="mt-6">
          <div className="grid gap-4">
            {mockTours
              .filter(tour => tour.routeName.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((tour) => (
                <Card key={tour.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{tour.routeName}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-600">Дата: {tour.startDate}</span>
                          <Badge variant="outline">{tour.price} ₽</Badge>
                          <Badge>{tour.participants} участников</Badge>
                        </div>
                        <span className="text-sm text-gray-500">ID: {tour.id}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit('tour', tour.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete('экскурсию', tour.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditSection;