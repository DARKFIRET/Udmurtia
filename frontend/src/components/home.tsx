import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import {
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  Landmark,
  Camera,
} from "lucide-react";

interface UdmurtiaInfo {
  title: string;
  description: string;
}

// Add static data outside the component
const staticData = {
  highlights: [
    "Богатое культурное наследие",
    "Живописные природные ландшафты",
    "Уникальные исторические памятники",
    "Традиционные ремесла и промыслы",
  ],
  facts: [
    {
      title: "Столица",
      description: "Ижевск - крупный промышленный и культурный центр",
    },
    { title: "Население", description: "Около 1.5 миллиона человек" },
    { title: "Площадь", description: "42,061 км²" },
    {
      title: "Известные бренды",
      description: "Концерн Калашников, Ижевские мотоциклы",
    },
  ],
};

interface Photo {
  id: number;
  description: string;
  url: string;
  created_at: string;
  user_id: number;
}

// Add these interfaces at the top with other interfaces
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
  days: number;
  slots: number;
  age_restriction: number;
  cost: string;
  created_at: string;
  points: RoutePoint[];
}

const Home: React.FC = () => {
  const [udmurtiaInfo, setUdmurtiaInfo] = React.useState<UdmurtiaInfo | null>(
    null,
  );
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [featuredAttractions, setFeaturedAttractions] = React.useState<Photo[]>(
    [],
  );
  // Add this state near other useState declarations
  const [tours, setTours] = React.useState<TourRoute[]>([]);

  React.useEffect(() => {
    const fetchUdmurtiaInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/udmurtia');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        setUdmurtiaInfo({
          title: data.title,
          description: data.description,
        });
        setLoading(false);
      } catch (err) {
        setError("Ошибка при загрузке данных");
        setLoading(false);
      }
    };

    fetchUdmurtiaInfo();
  }, []);

  React.useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/photos');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setFeaturedAttractions(data.photos);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    fetchPhotos();
  }, []);

  // Add this useEffect with other useEffects
  // React.useEffect(() => {
  //   const fetchTours = async () => {
  //     try {
  //       const response = await fetch('http://127.0.0.1:8000/api/routes');
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       const data = await response.json();
  //       setTours(data.routes);
  //     } catch (error) {
  //       console.error('Error fetching tours:', error);
  //     }
  //   };

  //   fetchTours();
  // }, []);

  // Featured tours (mock data)
  const featuredTours = [
    {
      id: 1,
      name: "Ижевск - оружейная столица",
      start_location: "Центральная площадь Ижевска",
      start_date: "2023-07-15",
      start_time: "10:00",
      cost: 1500,
      imageUrl:
        "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=800&q=80",
    },
    {
      id: 2,
      name: "По следам удмуртских легенд",
      start_location: "Деревня Карамас-Пельга",
      start_date: "2023-07-20",
      start_time: "09:00",
      cost: 2500,
      imageUrl:
        "https://images.unsplash.com/photo-1528702748617-c64d49f918af?w=800&q=80",
    },
    {
      id: 3,
      name: "Воткинск - родина Чайковского",
      start_location: "Музей-усадьба П.И. Чайковского",
      start_date: "2023-07-25",
      start_time: "11:00",
      cost: 1800,
      imageUrl:
        "https://images.unsplash.com/photo-1577334928618-2f6a516b0831?w=800&q=80",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Загрузка информации...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="text-center">
          <p className="text-destructive text-lg">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] bg-gradient-to-r from-primary/80 to-primary overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1200&q=80')",
          }}
        ></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {udmurtiaInfo?.title}
          </h1>
          <p className="text-xl text-white max-w-3xl mb-8">
            {udmurtiaInfo?.description}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Link to="/attractions">Достопримечательности</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white hover:bg-white hover:text-primary"
            >
              <Link to="/tours">Экскурсии</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Откройте для себя Удмуртию
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {staticData.highlights.map((highlight, index) => (
              <Card key={index} className="bg-white h-full">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {index === 0 && (
                      <Landmark className="h-6 w-6 text-primary" />
                    )}
                    {index === 1 && <MapPin className="h-6 w-6 text-primary" />}
                    {index === 2 && <Camera className="h-6 w-6 text-primary" />}
                    {index === 3 && (
                      <Calendar className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <CardTitle className="text-xl">{highlight}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Исследуйте уникальные особенности нашего региона и
                    погрузитесь в атмосферу Удмуртии.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Attractions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              Популярные достопримечательности
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAttractions.map((attraction) => (
              <Card key={attraction.id} className="overflow-hidden h-full">
                <div className="h-48 overflow-hidden">
                  <img
                    src={`http://127.0.0.1:8000${attraction.url}`}
                    alt={attraction.description}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>
                <CardHeader>
                  <CardDescription>{attraction.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Популярные экскурсии</h2>
            <Button asChild variant="ghost" className="flex items-center gap-2">
              <Link to="/tours">
                Все экскурсии <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Carousel className="w-full">
            <CarouselContent>
              {tours.map((tour) => (
                <CarouselItem
                  key={tour.id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="h-full">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={tour.points[0]?.photo_url 
                          ? `http://127.0.0.1:8000${tour.points[0].photo_url}`
                          : 'https://via.placeholder.com/400x300'}
                        alt={tour.points[0]?.description || 'Tour image'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle>{tour.start_location}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {tour.start_location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(tour.start_date).toLocaleDateString(
                              "ru-RU",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{tour.start_time}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        <span>Длительность: {tour.days} дн.</span>
                        <span className="mx-2">•</span>
                        <span>Мест: {tour.slots}</span>
                      </div>
                      <div className="mt-4 font-semibold">
                        {Number(tour.cost).toLocaleString('ru-RU')} ₽
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link to={`/tours/${tour.id}`}>Забронировать</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-4" />
              <CarouselNext className="-right-4" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Facts Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Интересные факты
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {staticData.facts.map((fact, index) => (
              <Card key={index} className="text-center h-full">
                <CardHeader>
                  <CardTitle className="text-primary">{fact.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{fact.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Готовы исследовать Удмуртию?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к нашим экскурсиям и откройте для себя уникальную
            культуру и природу этого удивительного региона.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Link to="/tours">Выбрать экскурсию</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Link to="/register">Зарегистрироваться</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
