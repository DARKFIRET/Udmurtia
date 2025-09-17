import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import axios from "axios";

interface RoutePoint {
  id: number;
  description: string;
  photo_url: string | null;
  order: number;
}

interface TourRoute {
  id: number;
  start_location: string;
  start_date: string;
  start_time: string;
  cost: string;
  points: RoutePoint[];
}

const Tours = () => {
  const [tours, setTours] = useState<TourRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/routes');
        setTours(response.data.routes);
      } catch (error) {
        console.error('Error fetching tours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Экскурсии</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tours.map((tour) => (
          <Link key={tour.id} to={`/tours/${tour.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden">
                <img
                  src={tour.points[0]?.photo_url 
                    ? `http://127.0.0.1:8000${tour.points[0].photo_url}`
                    : 'https://via.placeholder.com/400x300'}
                  alt={tour.start_location}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{tour.start_location}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(tour.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{tour.start_time}</span>
                  </div>
                </div>
                <div className="text-lg font-bold">
                  {Number(tour.cost).toLocaleString('ru-RU')} ₽
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Tours;