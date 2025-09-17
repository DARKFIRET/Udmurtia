import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/utils/api";
import { motion } from "framer-motion";

interface UserInfo {
  first_name: string;
  last_name: string;
  patronymic: string | null;
  email: string;
  birth_date: string | null;
}

interface Booking {
  route_id: number;
  start_location: string;
  start_date: string;
  start_time: string;
  slots_booked: number;
}

const Profile = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, bookingsResponse] = await Promise.all([
          api.get("/user"),
          api.get("/bookings"),
        ]);

        const user = userResponse.data.data || userResponse.data;
        const bookings = bookingsResponse.data.bookings || bookingsResponse.data;

        setUserInfo(user);
        setBookings(Array.isArray(bookings) ? bookings : []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleCancelBooking = async (routeId: number) => {
    try {
      setCancellingId(routeId);
      await api.post(`/routes/${routeId}/cancel`);
      setBookings((prev) => prev.filter((b) => b.route_id !== routeId));
    } catch (error) {
      console.error("Error cancelling booking:", error);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-lg">
        Загружаем ваш профиль...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* --- Профиль --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-blue-400 shadow">
              <AvatarFallback className="bg-blue-500 text-white text-2xl">
                {userInfo?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {[userInfo?.last_name, userInfo?.first_name, userInfo?.patronymic]
                  .filter(Boolean)
                  .join(" ")}
              </h1>
              <p className="text-gray-600">{userInfo?.email}</p>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="p-4 rounded-lg bg-white shadow-inner">
              <h2 className="font-semibold text-gray-500 text-sm mb-1">
                Дата рождения
              </h2>
              <p className="text-gray-800 text-lg">
                {userInfo?.birth_date
                  ? format(new Date(userInfo.birth_date), "dd.MM.yyyy")
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* --- Бронирования --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="shadow-xl border-0">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900">Мои бронирования</h2>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <p className="text-lg font-medium">У вас пока нет бронирований</p>
                <p className="text-sm">Забронируйте экскурсию и она появится здесь</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Локация</TableHead>
                    <TableHead>Дата и время начала</TableHead>
                    <TableHead>Количество мест</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking, i) => (
                    <motion.tr
                      key={booking.route_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        {booking.start_location}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(`${booking.start_date}T${booking.start_time}`),
                          "dd.MM.yyyy HH:mm"
                        )}
                      </TableCell>
                      <TableCell>{booking.slots_booked}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.route_id)}
                          disabled={cancellingId === booking.route_id}
                          className="transition-transform hover:scale-105"
                        >
                          {cancellingId === booking.route_id
                            ? "Отмена..."
                            : "Отменить"}
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;
