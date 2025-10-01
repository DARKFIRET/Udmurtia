import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

interface RoutePoint {
  description: string;
  photo_url: string;
  order: number;
  day: number | null;
}

interface Excursion {
  id: number;
  start_point: string;
  start_date: string;
  start_time: string;
  all_days: number;
  all_people: number;
  age_limit: number;
  cost?: number; // базовая цена (иногда называется cost)
  discount_price?: number; // fallback, если cost отсутствует
  available_slots: number;
  route: {
    id: number;
    description: string;
    route_points: RoutePoint[];
  };
}

const TourDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [participantCount, setParticipantCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tourData, setTourData] = useState<Excursion | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);

  const fetchData = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/excursions/${id}`);
      // API ответ: экскурсия как объект (см. пример пользователя)
      setTourData(res.data);
      // ensure participantCount not exceeding available slots after refresh
      const avail = res.data?.available_slots ?? 0;
      setParticipantCount((prev) =>
        Math.min(Math.max(prev, 1), Math.max(1, avail))
      );
    } catch (e) {
      console.error("Ошибка загрузки экскурсии:", e);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!tourData) {
    return <div>Loading...</div>;
  }

  // choose base price: prefer cost, fallback to discount_price
  const basePrice =
    typeof tourData.cost === "number"
      ? tourData.cost
      : tourData.discount_price ?? 0;
  const totalSlots = tourData.all_people;
  const availableSlots = tourData.available_slots;

  const formattedDate = () => {
    try {
      return format(new Date(tourData.start_date), "dd.MM.yyyy");
    } catch {
      return tourData.start_date;
    }
  };

  /**
   * Рассчёт поэтапной стоимости брони:
   * - Для каждого бронируемого места берём текущий процент свободных мест (available / total)
   * - В зависимости от диапазона применяем множитель:
   *    >= 70% -> 0.75 (скидка 25%)
   *    50%..69% -> 0.90 (скидка 10%)
   *    < 50% -> 1.00
   * - После "взятия" места available-- и продолжаем для следующего
   */
  const calculateTotalCost = (count: number) => {
    let remainingAvailable = availableSlots;
    let total = 0;
    let breakdown = {
      at75: 0,
      at90: 0,
      at100: 0,
    };

    // guard: если totalSlots === 0, считаем все по полной цене (чтобы не делить на 0)
    for (let i = 0; i < count; i++) {
      const availabilityPercent =
        totalSlots > 0 ? (remainingAvailable / totalSlots) * 100 : 0;
      let multiplier = 1;

      if (availabilityPercent >= 70) {
        multiplier = 0.75;
        breakdown.at75 += 1;
      } else if (availabilityPercent >= 50) {
        multiplier = 0.9;
        breakdown.at90 += 1;
      } else {
        multiplier = 1;
        breakdown.at100 += 1;
      }

      total += basePrice * multiplier;
      // reduce available (booking this slot)
      remainingAvailable = Math.max(0, remainingAvailable - 1);
    }

    // round to 2 decimals
    total = Math.round(total * 100) / 100;
    return { total, breakdown };
  };

  const { total: computedTotal, breakdown } = useMemo(
    () => calculateTotalCost(participantCount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [participantCount, tourData] // recalc when participantCount or tourData changes
  );

  const handleBooking = async () => {
    if (participantCount < 1 || participantCount > availableSlots) {
      alert(
        "Пожалуйста, выберите корректное количество участников (не больше доступных мест)."
      );
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`http://127.0.0.1:8000/api/excursions/${id}/book`, {
        slots: participantCount,
      });
      alert("Бронирование успешно оформлено!");
      // обновляем данные экскурсии чтобы показать новое available_slots
      await fetchData();
    } catch (error: any) {
      console.error("Ошибка бронирования:", error);
      const msg =
        error?.response?.data?.message ??
        "Ошибка при бронировании. Пожалуйста, попробуйте снова.";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const notEnoughSlots = participantCount > availableSlots;

  return (
    <div className="container mx-auto py-8 px-4 bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-8">
            <Carousel className="w-full">
              <CarouselContent>
                {tourData.route.route_points.map((point, idx) => (
                  <CarouselItem key={point.order ?? idx}>
                    <div className="p-1">
                      <div className="overflow-hidden rounded-xl aspect-[16/9]">
                        <img
                          src={point.photo_url}
                          alt={point.description}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-center mt-2">
                        День {point.day ?? "—"}: {point.description}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4" />
              <CarouselNext className="-right-4" />
            </Carousel>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{tourData.start_point}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formattedDate()}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {tourData.start_time.substring(0, 5)}
                  </Badge>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{tourData.start_point}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {tourData.all_days}{" "}
                    {tourData.all_days === 1
                      ? "день"
                      : tourData.all_days < 5
                      ? "дня"
                      : "дней"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Свободных мест</p>
                    <p className="text-sm text-muted-foreground">
                      {availableSlots} из {totalSlots}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <span>Возраст: {tourData.age_limit}+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Забронировать экскурсию</CardTitle>
              <CardDescription>
                Стоимость (базовая): {basePrice.toLocaleString("ru-RU")} ₽ с
                человека
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="participants">Количество участников</Label>
                  <Input
                    id="participants"
                    type="number"
                    min={1}
                    max={availableSlots}
                    value={participantCount}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10) || 1;
                      setParticipantCount(Math.max(1, v));
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Доступно: {availableSlots} мест. Максимум: {availableSlots}
                  </p>
                  {notEnoughSlots && (
                    <p className="text-sm text-destructive mt-1">
                      Недостаточно свободных мест
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Итого:</span>
                    <span className="text-xl font-bold flex items-center">
                      {computedTotal.toLocaleString("ru-RU", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}{" "}
                      ₽
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-muted-foreground">
                    <div>Разбивка по тарифам (слотов):</div>
                    <ul className="mt-1 ml-4 list-disc">
                      <li>75% от цены: {breakdown.at75} шт.</li>
                      <li>90% от цены: {breakdown.at90} шт.</li>
                      <li>100% от цены: {breakdown.at100} шт.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleBooking}
                disabled={
                  isLoading ||
                  participantCount < 1 ||
                  participantCount > availableSlots
                }
              >
                {isLoading ? "Оформление..." : "Забронировать"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
