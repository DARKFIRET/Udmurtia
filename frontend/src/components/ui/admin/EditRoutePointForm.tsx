import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface EditRoutePointFormProps {
  pointId: string;
  onCancel: () => void;
}

interface RoutePointForm {
  name: string;
  photo: FileList;
}

// Моковые данные для загрузки
const mockPointData = {
  "1": { name: "Ижевский пруд", photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80" },
  "2": { name: "Музей Калашникова", photo: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=400&q=80" },
  "3": { name: "Архитектурно-этнографический музей", photo: "https://images.unsplash.com/photo-1564399580075-5dfe19c205f3?w=400&q=80" },
};

const EditRoutePointForm = ({ pointId, onCancel }: EditRoutePointFormProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RoutePointForm>();

  useEffect(() => {
    // Загрузка данных точки маршрута
    const pointData = mockPointData[pointId as keyof typeof mockPointData];
    if (pointData) {
      setValue("name", pointData.name);
      setCurrentImage(pointData.photo);
    }
  }, [pointId, setValue]);

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
    console.log('Обновление точки маршрута:', {
      id: pointId,
      name: data.name,
      photo: data.photo[0] || currentImage
    });
    
    toast({
      title: "Точка маршрута обновлена",
      description: `Точка "${data.name}" успешно обновлена`,
    });
    
    onCancel();
  };

  const displayImage = previewImage || currentImage;

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
          {displayImage ? (
            <div className="relative">
              <img
                src={displayImage}
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
                    Загрузить новую фотографию
                  </span>
                </Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register("photo")}
                  onChange={handleImageChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Сохранить изменения
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
};

export default EditRoutePointForm;