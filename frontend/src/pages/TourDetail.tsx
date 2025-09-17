import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import axios from "axios";

interface RoutePoint {
  id: number;
  description: string;
  photo_url: string | null;
  order: number;
}

interface TourDetail {
  id: number;
  start_location: string;
  start_date: string;
  start_time: string;
  days: number;
  slots: number;
  age_restriction: number;
  cost: string;
  points: RoutePoint[];
}

const TourDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [participants, setParticipants] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchTourDetail = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/routes/${id}`);
        setTour(response.data);
      } catch (error) {
        console.error('Error fetching tour:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetail();
  }, [id]);

  const handleBook = async () => {
    try {
      setBooking(true);
      await axios.post(`http://127.0.0.1:8000/api/routes/${id}/book`, {
        slots: participants
      });
      alert('Бронирование успешно!');
    } catch (error) {
      alert('Ошибка при бронировании');
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
        <div className="lg:col-span-2">
          <Carousel className="w-full">
            <CarouselContent>
              {tour.points.map((point) => (
                point.photo_url && (
                  <CarouselItem key={point.id}>
                    <div className="relative h-[400px]">
                      <img
                        src={`http://127.0.0.1:8000${point.photo_url}`}
                        alt={point.description}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-3 rounded-b-lg">
                        <p className="text-sm text-gray-800">{point.description}</p>
                      </div>
                    </div>
                  </CarouselItem>
                )
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="mt-8 space-y-6">
            <h1 className="text-3xl font-bold">{tour.start_location}</h1>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(tour.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{tour.start_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Свободных мест: {tour.slots}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span>Возраст: {tour.age_restriction}+</span>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Длительность</h2>
              <p>{tour.days} дня</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 pl-8" >
          <div className="sticky top-4 bg-card rounded-lg p-6 shadow">
            <h3 className="text-xl font-semibold mb-4">Забронировать</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Количество участников</label>
                <Input
                  type="number"
                  min={1}
                  max={tour.slots}
                  value={participants}
                  onChange={(e) => setParticipants(Number(e.target.value))}
                />
              </div>
              
              <div className="text-lg font-bold">
                Итого: {(Number(tour.cost) * participants).toLocaleString('ru-RU')} ₽
              </div>

              <Button 
                className="w-full" 
                onClick={handleBook}
                disabled={booking || participants < 1 || participants > tour.slots}
              >
                {booking ? 'Бронирование...' : 'Забронировать'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;