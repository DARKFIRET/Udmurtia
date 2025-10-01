import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface EditRouteFormProps {
  routeId: string;
  onCancel: () => void;
}

interface RoutePointDay {
  pointId: string;
  day: number;
}

interface RouteForm {
  description: string;
  points: RoutePointDay[];
}

// Моковые данные
const mockRoutePoints = [
  { id: "1", name: "Ижевский пруд" },
  { id: "2", name: "Музей Калашникова" },
  { id: "3", name: "Архитектурно-этнографический музей" },
  { id: "4", name: "Парк Кирова" },
  { id: "5", name: "Свято-Михайловский собор" },
];

const mockRouteData = {
  "1": {
    description: "Знакомство с историческим центром города Ижевска",
    points: [
      { pointId: "1", day: 1 },
      { pointId: "2", day: 1 },
      { pointId: "3", day: 2 }
    ]
  },
  "2": {
    description: "Путешествие по природным достопримечательностям Удмуртии",
    points: [
      { pointId: "4", day: 1 },
      { pointId: "5", day: 2 }
    ]
  }
};

const EditRouteForm = ({ routeId, onCancel }: EditRouteFormProps) => {
  const { toast } = useToast();
  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<RouteForm>({
    defaultValues: {
      description: "",
      points: [{ pointId: "", day: 1 }]
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "points"
  });

  useEffect(() => {
    // Загрузка данных маршрута
    const routeData = mockRouteData[routeId as keyof typeof mockRouteData];
    if (routeData) {
      setValue("description", routeData.description);
      replace(routeData.points);
    }
  }, [routeId, setValue, replace]);

  const onSubmit = (data: RouteForm) => {
    console.log('Обновление маршрута:', {
      id: routeId,
      ...data
    });
    
    toast({
      title: "Маршрут обновлен",
      description: "Маршрут успешно обновлен",
    });
    
    onCancel();
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
                      defaultValue={field.pointId}
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

      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Сохранить изменения
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
};

export default EditRouteForm;