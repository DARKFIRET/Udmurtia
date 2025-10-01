import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

// Моковые данные маршрутов
const mockRoutes = [
  { id: "1", name: "Исторический центр Ижевска" },
  { id: "2", name: "Природные красоты Удмуртии" },
  { id: "3", name: "Культурное наследие республики" },
];

const CreateTour = () => {
  const { toast } = useToast();
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<TourForm>();

  const onSubmit = (data: TourForm) => {
    // Здесь будет отправка данных на сервер
    console.log('Создание экскурсии:', data);
    
    toast({
      title: "Экскурсия создана",
      description: "Экскурсия успешно создана и готова к бронированию",
    });
    
    reset();
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

      <Button type="submit" className="w-full">
        <Calendar className="mr-2 h-4 w-4" />
        Создать экскурсию
      </Button>
    </form>
  );
};

export default CreateTour;