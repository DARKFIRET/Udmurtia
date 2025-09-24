import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users } from "lucide-react";
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
  discount_price: number;
  route: {
    id: number;
    description: string;
    route_points: RoutePoint[];
  };
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [tours, setTours] = useState<Excursion[]>([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get("q") || "";

  useEffect(() => {
    const searchTours = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/routes/search",
          { title: query }
        );
        setTours(response.data.excursions);
      } catch (error) {
        console.error("Error searching excursions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      searchTours();
    }
  }, [query]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Поиск...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">
        Результаты поиска: {query}
      </h1>

      {tours.length === 0 ? (
        <p className="text-muted-foreground">
          По вашему запросу ничего не найдено
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <Link key={tour.id} to={`/tours/${tour.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img
                    src={
                      tour.route.route_points[0]?.photo_url ??
                      "https://via.placeholder.com/400x300"
                    }
                    alt={tour.start_point}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{tour.start_point}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(tour.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{tour.start_time.substring(0, 5)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4" />
                    <span>{tour.all_people} мест</span>
                  </div>
                  <div className="text-lg font-bold">
                    {tour.discount_price.toLocaleString("ru-RU")} ₽
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
