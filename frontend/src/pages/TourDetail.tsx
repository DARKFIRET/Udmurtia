import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Users, AlertCircle, DollarSign } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import axios from "axios";

interface RoutePoint {
  description: string;
  photo_url: string;
  order: number;
  day: number;
}

interface Excursion {
  id: number;
  start_point: string;
  start_date: string;
  start_time: string;
  all_days: number;
  all_people: number;
  age_limit: number;
  cost: number;
  available_slots: number;
  route: {
    id: number;
    description: string;
    route_points: RoutePoint[];
  };
}

// === Функция расчёта стоимости (как на бэке) ===
const calculateTotalCost = (
  cost: number,
  slotsBooked: number,
  allBookedSlots: number,
  totalSlots: number
) => {
  const firstThreshold = totalSlots * 0.3; // первые 30% — скидка 25%
  const secondThreshold = totalSlots * 0.5; // до 50% — скидка 10%

  // сколько мест попадает в первый диапазон
  const slotsWith25Discount = Math.min(
    Math.max(firstThreshold - allBookedSlots, 0),
    slotsBooked
  );

  // сколько мест попадает во второй диапазон
  const slotsWith10Discount = Math.min(
    Math.max(secondThreshold - allBookedSlots - slotsWith25Discount, 0),
    slotsBooked - slotsWith25Discount
  );

  // оставшиеся без скидки
  const slotsWithoutDiscount =
    slotsBooked - slotsWith25Discount - slotsWith10Discount;

  const totalCost =
    slotsWith25Discount * cost * 0.75 +
    slotsWith10Discount * cost * 0.9 +
    slotsWithoutDiscount * cost;

  return {
    total: Math.round(totalCost),
    breakdown: {
      slotsWith25Discount,
      slotsWith10Discount,
      slotsWithoutDiscount,
    },
  };
};

const TourDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<Excursion | null>(null);
  const [participants, setParticipants] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const fetchTourDetail = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/excursions/${id}`
      );
      setTour(response.data);
      // ограничим участников по available_slots
      setParticipants((prev) =>
        Math.min(Math.max(prev, 1), response.data.available_slots || 1)
      );
    } catch (error) {
      console.error("Error fetching excursion:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourDetail();
  }, [id]);

  const { total, breakdown } = useMemo(() => {
    if (!tour) return { total: 0, breakdown: {} as any };
    const allBookedSlots = tour.all_people - tour.available_slots;
    return calculateTotalCost(
      tour.cost,
      participants,
      allBookedSlots,
      tour.all_people
    );
  }, [participants, tour]);

  const handleBook = async () => {
    try {
      setBooking(true);
      await axios.post(`http://127.0.0.1:8000/api/excursions/${id}/book`, {
        slots: participants,
      });
      alert("Бронирование успешно!");
      fetchTourDetail();
    } catch (error) {
      alert("Ошибка при бронировании");
    } finally {
      setBooking(false);
    }
  };

  if (loading || !tour) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Слайдер с точками маршрута */}
        <div className="lg:col-span-2">
          <Carousel className="w-full">
            <CarouselContent>
              {tour.route.route_points.map((point, idx) =>
                point.photo_url ? (
                  <CarouselItem key={idx}>
                    <div className="relative h-[400px]">
                      <img
                        src={point.photo_url}
                        alt={point.description}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-3 rounded-b-lg">
                        <p className="text-sm text-gray-800">
                          День {point.day}: {point.description}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ) : null
              )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="mt-8 space-y-6">
            <h1 className="text-3xl font-bold">{tour.start_point}</h1>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(tour.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{tour.start_time.substring(0, 5)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>
                  Свободных мест: {tour.available_slots} из {tour.all_people}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>Возраст: {tour.age_limit}+</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Длительность</h2>
              <p>{tour.all_days} дня</p>
            </div>
          </div>
        </div>

        {/* Бронирование */}
        <div className="lg:col-span-1 pl-8">
          <div className="sticky top-4 bg-card rounded-lg p-6 shadow">
            <h3 className="text-xl font-semibold mb-4">Забронировать</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">
                  Количество участников
                </label>
                <Input
                  type="number"
                  min={1}
                  max={tour.available_slots}
                  value={participants}
                  onChange={(e) =>
                    setParticipants(
                      Math.min(
                        Math.max(1, Number(e.target.value) || 1),
                        tour.available_slots
                      )
                    )
                  }
                />
              </div>

              <div className="text-lg font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Итого: {total.toLocaleString("ru-RU")} ₽
              </div>

              {/* Разбивка стоимости */}
              <div className="text-sm text-gray-600 space-y-1">
                {breakdown.slotsWith25Discount > 0 && (
                  <p>
                    {breakdown.slotsWith25Discount} × {tour.cost} ₽ (−25%)
                  </p>
                )}
                {breakdown.slotsWith10Discount > 0 && (
                  <p>
                    {breakdown.slotsWith10Discount} × {tour.cost} ₽ (−10%)
                  </p>
                )}
                {breakdown.slotsWithoutDiscount > 0 && (
                  <p>
                    {breakdown.slotsWithoutDiscount} × {tour.cost} ₽ (без скидки)
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleBook}
                disabled={
                  booking ||
                  participants < 1 ||
                  participants > tour.available_slots
                }
              >
                {booking ? "Бронирование..." : "Забронировать"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
