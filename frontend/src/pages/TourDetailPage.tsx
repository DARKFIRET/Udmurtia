import React, { useState } from "react";
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

interface TourPoint {
  id: number;
  photo_url: string;
  description: string;
}

interface TourDetail {
  id: number;
  start_location: string;
  start_date: string;
  start_time: string;
  days: number;
  slots: number;
  age_restriction: number;
  cost: number;
  points: TourPoint[];
}

const TourDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [participantCount, setParticipantCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tourData, setTourData] = useState<TourDetail>({
    id: 1,
    start_location: "Ижевск, Центральная площадь",
    start_date: "2023-07-15",
    start_time: "09:00:00",
    days: 2,
    slots: 15,
    age_restriction: 12,
    cost: 2500,
    points: [
      {
        id: 1,
        photo_url: "/uploads/tours/izhevsk-1.jpg",
        description: "Центральная площадь Ижевска",
      },
      {
        id: 2,
        photo_url: "/uploads/tours/izhevsk-2.jpg",
        description: "Набережная Ижевского пруда",
      },
      {
        id: 3,
        photo_url: "/uploads/tours/izhevsk-3.jpg",
        description: "Музей оружия",
      },
    ],
  });

  // Format date for display
  const formattedDate = () => {
    try {
      const date = new Date(tourData.start_date);
      return format(date, "dd.MM.yyyy");
    } catch (e) {
      return tourData.start_date;
    }
  };

  // Calculate total cost
  const totalCost = tourData.cost * participantCount;

  // Handle booking submission
  const handleBooking = async () => {
    if (participantCount < 1 || participantCount > tourData.slots) {
      alert("Пожалуйста, выберите корректное количество участников");
      return;
    }

    setIsLoading(true);
    try {
      // Simulated API call
      // In a real implementation, you would make an actual API call here
      // const response = await fetch(`http://127.0.0.1:8000/api/routes/${id}/book`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({ slots: participantCount })
      // });
      // const data = await response.json();

      // Simulate API response delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Бронирование успешно оформлено!");
    } catch (error) {
      console.error("Error booking tour:", error);
      alert("Ошибка при бронировании. Пожалуйста, попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tour Details Section */}
        <div className="lg:col-span-2">
          {/* Photo Gallery */}
          <div className="mb-8">
            <Carousel className="w-full">
              <CarouselContent>
                {tourData.points.map((point) => (
                  <CarouselItem key={point.id}>
                    <div className="p-1">
                      <div className="overflow-hidden rounded-xl aspect-[16/9]">
                        <img
                          src={`http://127.0.0.1:8000${point.photo_url}`}
                          alt={point.description}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback image if the tour image fails to load
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80";
                          }}
                        />
                      </div>
                      <p className="text-sm text-center mt-2">
                        {point.description}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4" />
              <CarouselNext className="-right-4" />
            </Carousel>
          </div>

          {/* Tour Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {tourData.start_location}
              </CardTitle>
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Место начала</p>
                      <p className="text-sm text-muted-foreground">
                        {tourData.start_location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Длительность</p>
                      <p className="text-sm text-muted-foreground">
                        {tourData.days}{" "}
                        {tourData.days === 1
                          ? "день"
                          : tourData.days < 5
                            ? "дня"
                            : "дней"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Свободные места</p>
                      <p className="text-sm text-muted-foreground">
                        {tourData.slots}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Возрастное ограничение
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tourData.age_restriction}+
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2">
                    Описание маршрута
                  </h3>
                  <p className="text-muted-foreground">
                    Увлекательное путешествие по историческим и культурным
                    местам Удмуртии. Вы посетите главные достопримечательности
                    региона, познакомитесь с местными традициями и отведаете
                    блюда национальной кухни.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form Section */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Забронировать экскурсию</CardTitle>
              <CardDescription>
                Стоимость: {tourData.cost} ₽ с человека
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="participants">Количество участников</Label>
                  <Input
                    id="participants"
                    type="number"
                    min="1"
                    max={tourData.slots}
                    value={participantCount}
                    onChange={(e) =>
                      setParticipantCount(parseInt(e.target.value) || 1)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Максимум: {tourData.slots} мест
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Итого:</span>
                    <span className="text-xl font-bold flex items-center">
                      <DollarSign className="h-5 w-5" />
                      {totalCost} ₽
                    </span>
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
                  participantCount > tourData.slots
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
