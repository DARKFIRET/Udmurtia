import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface EditTourFormProps {
  tourId: string;
  onCancel: () => void;
}

interface TourForm {
  routeId: string;
  startDate: string;
  startTime: string;
  duration: number;
  price: number;
  maxParticipants: number;
  startLocation: string;
  ageRestriction: string;
}

// Моковые данные
const mockRoutes = [
  { id: "1", name: "Исторический центр Ижевска" },
  { id: "2", name: "Природные красоты Удмуртии" },
  { id: "3", name: "Культурное наследие республики" },
];

const mockTourData = {
  "1": {
    routeId: "1",
    startDate: "2024-03-15",
    startTime: "10:00",
    duration: 2,
    price: 2500,
    maxParticipants: 20,
    startLocation: "Центральная площадь",
    ageRestriction: "6+"
  },
  "2": {
    routeId: "2",
    startDate: "2024-03-20",
    startTime: "09:00",
    duration: 3,
    price: 3500,
    maxParticipants: 15,
    startLocation: "Автовокзал",
    ageRestriction: "12+"
  }
};

const EditTourForm = ({ tourId, onCancel }: EditTourFormProps) => {
  const { toast } = useToast();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TourForm>();

  useEffect(() => {
    // Загрузка данных экскурсии
    const tourData = mockTourData[tourId as keyof typeof mockTourData];
    if (tourData) {
      Object.entries(tourData).forEach(([key, value]) => {
        setValue(key as keyof TourForm, value);
      });
    }
  }, [tourId, setValue]);

  const onSubmit = (data: TourForm) => {
    console.log('Обновление экскурсии:', {
      id: tourId,
      ...data
    });
    
    toast({
      title: "Экскурсия обновлена",
      description: "Экскурсия успешно обновлена",
    });
    
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="routeId">Маршрут</Label>
          <Select onValueChange={(value) => setValue("routeId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите маршрут" />
            </SelectTrigger>
            <SelectContent>
              {mockRoutes.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startLocation">Стартовая локация</Label>
          <Input
            id="startLocation"
            placeholder="Место начала экскурсии"
            {...register("startLocation", { required: "Стартовая локация обязательна" })}
          />
          {errors.startLocation && (
            <p className="text-sm text-red-500">{errors.startLocation.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="startDate">Дата начала</Label>
          <Input
            id="startDate"
            type="date"
            {...register("startDate", { required: "Дата начала обязательна" })}
          />
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Время начала</Label>
          <Input
            id="startTime"
            type="time"
            {...register("startTime", { required: "Время начала обязательно" })}
          />
          {errors.startTime && (
            <p className="text-sm text-red-500">{errors.startTime.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="duration">Количество дней</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            placeholder="Дни"
            {...register("duration", { 
              required: "Количество дней обязательно",
              min: { value: 1, message: "Минимум 1 день" }
            })}
          />
          {errors.duration && (
            <p className="text-sm text-red-500">{errors.duration.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Стоимость (₽)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            placeholder="Цена"
            {...register("price", { 
              required: "Стоимость обязательна",
              min: { value: 0, message: "Стоимость не может быть отрицательной" }
            })}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxParticipants">Количество мест</Label>
          <Input
            id="maxParticipants"
            type="number"
            min="1"
            placeholder="Места"
            {...register("maxParticipants", { 
              required: "Количество мест обязательно",
              min: { value: 1, message: "Минимум 1 место" }
            })}
          />
          {errors.maxParticipants && (
            <p className="text-sm text-red-500">{errors.maxParticipants.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ageRestriction">Возрастное ограничение</Label>
        <Select onValueChange={(value) => setValue("ageRestriction", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите возрастное ограничение" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0+">0+ (без ограничений)</SelectItem>
            <SelectItem value="6+">6+ (дети от 6 лет)</SelectItem>
            <SelectItem value="12+">12+ (подростки от 12 лет)</SelectItem>
            <SelectItem value="16+">16+ (от 16 лет)</SelectItem>
            <SelectItem value="18+">18+ (только взрослые)</SelectItem>
          </SelectContent>
        </Select>
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

export default EditTourForm;