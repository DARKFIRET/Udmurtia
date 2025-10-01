import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface RoutePointForm {
  name: string;
  photo: FileList;
}

const CreateRoutePoint = () => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoutePointForm>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const onSubmit = (data: RoutePointForm) => {
    // Здесь будет отправка данных на сервер
    console.log('Создание точки маршрута:', {
      name: data.name,
      photo: data.photo[0]
    });
    
    toast({
      title: "Точка маршрута создана",
      description: `Точка "${data.name}" успешно добавлена`,
    });
    
    reset();
    setPreviewImage(null);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Название точки маршрута</Label>
        <Input
          id="name"
          placeholder="Введите название точки"
          {...register("name", { required: "Название обязательно" })}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="photo">Фотография</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          {previewImage ? (
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="photo" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Загрузить фотографию
                  </span>
                </Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register("photo", { required: "Фотография обязательна" })}
                  onChange={handleImageChange}
                />
              </div>
            </div>
          )}
        </div>
        {errors.photo && (
          <p className="text-sm text-red-500">{errors.photo.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        <MapPin className="mr-2 h-4 w-4" />
        Создать точку маршрута
      </Button>
    </form>
  );
};

export default CreateRoutePoint;