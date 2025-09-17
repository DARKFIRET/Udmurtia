import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface TourCardProps {
  id: number;
  image: string;
  name: string;
  startDate: string;
  startTime: string;
  cost: number;
  availableSlots?: number;
}

const TourCard = ({
  id = 1,
  image = "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&q=80",
  name = "Экскурсия по Ижевску",
  startDate = "2023-07-15",
  startTime = "10:00",
  cost = 1500,
  availableSlots = 10,
}: TourCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/routes/${id}`);
  };

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card
      className="w-[350px] h-[400px] overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-white"
      onClick={handleCardClick}
    >
      <div className="h-48 overflow-hidden relative">
        <img
          src={
            image.startsWith("http") ? image : `http://127.0.0.1:8000${image}`
          }
          alt={name}
          className="w-full h-full object-cover"
        />
        {availableSlots <= 5 && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Осталось мест: {availableSlots}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold line-clamp-2">{name}</h3>
      </CardHeader>

      <CardContent className="pb-2 flex-grow">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <CalendarIcon size={16} />
          <span>{formatDate(startDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Clock size={16} />
          <span>{startTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={16} />
          <span className="line-clamp-1">{name}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex justify-between items-center">
        <div className="text-lg font-bold">{cost} ₽</div>
        <Button size="sm">Подробнее</Button>
      </CardFooter>
    </Card>
  );
};

export default TourCard;
