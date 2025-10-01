import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Route } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface RoutePointDay {
  pointId: string;
  day: number;
}

interface RouteForm {
  description: string;
  points: RoutePointDay[];
}

// Моковые данные точек маршрута
const mockRoutePoints = [
  { id: "1", name: "Ижевский пруд" },
  { id: "2", name: "Музей Калашникова" },
  { id: "3", name: "Архитектурно-этнографический музей" },
  { id: "4", name: "Парк Кирова" },
  { id: "5", name: "Свято-Михайловский собор" },
];

const CreateRoute = () => {
  const { toast } = useToast();
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<RouteForm>({
    defaultValues: {
      description: "",
      points: [{ pointId: "", day: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "points"
  });

  const onSubmit = (data: RouteForm) => {
    // Здесь будет отправка данных на сервер
    console.log('Создание маршрута:', data);
    
    toast({
      title: "Маршрут создан",
      description: "Маршрут успешно создан с выбранными точками",
    });
    
    reset();
  };

  const addPoint = () => {
    const maxDay = Math.max(...fields.map(field => field.day), 0);
    append({ pointId: "", day: maxDay + 1 });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description">Описание маршрута</Label>
        <Textarea
          id="description"
          placeholder="Введите описание маршрута"
          rows={4}
          {...register("description", { required: "Описание обязательно" })}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Точки маршрута</Label>
          <Button type="button" variant="outline" size="sm" onClick={addPoint}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить точку
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  Точка {index + 1}
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Точка маршрута</Label>
                    <Select
                      onValueChange={(value) => {
                        const points = [...fields];
                        points[index] = { ...points[index], pointId: value };
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите точку" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockRoutePoints.map((point) => (
                          <SelectItem key={point.id} value={point.id}>
                            {point.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>День посещения</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="День"
                      {...register(`points.${index}.day` as const, {
                        required: "День обязателен",
                        min: { value: 1, message: "День должен быть больше 0" }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        <Route className="mr-2 h-4 w-4" />
        Создать маршрут
      </Button>
    </form>
  );
};

export default CreateRoute;