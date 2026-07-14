import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "sonner";
import { X } from "lucide-react";
import { registrationService } from "../services/registration-service";
import { useAuth } from "@/features/auth/model/auth-store";

// Zod validation schema
const registrationSchema = z.object({
  // Thông tin cá nhân
  customerName: z.string().min(1, "Tên khách hàng là bắt buộc").min(3, "Tên phải ít nhất 3 ký tự"),
  phone: z
    .string()
    .min(1, "Số điện thoại là bắt buộc")
    .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
  email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  address: z.string().min(1, "Địa chỉ là bắt buộc"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Giới tính là bắt buộc" }),
  }),
  idType: z.enum(["cccd", "passport", "other"], {
    errorMap: () => ({ message: "Loại giấy tờ là bắt buộc" }),
  }),
  idNumber: z.string().min(1, "Số giấy tờ là bắt buộc").min(8, "Số giấy tờ không hợp lệ"),

  // Thông tin lưu trú
  numberOfPeople: z.string().min(1, "Số người ở là bắt buộc"),
  roomType: z.enum(["whole-room", "shared-room"], {
    errorMap: () => ({ message: "Loại phòng là bắt buộc" }),
  }),
  rentalType: z.string().min(1, "Loại hình thuê là bắt buộc"),
  rentalDuration: z.string().min(1, "Thời hạn thuê là bắt buộc"),
  desiredArea: z.string().min(1, "Khu vực mong muốn là bắt buộc"),
  priceRange: z.string().min(1, "Mức giá là bắt buộc"),
  moveInDate: z.string().min(1, "Ngày dự kiến vào ở là bắt buộc"),

  // Tiêu chí
  parkingRequired: z.boolean().default(false),
  acRequired: z.boolean().default(false),
  wifiRequired: z.boolean().default(false),
  kitchenRequired: z.boolean().default(false),
  gymRequired: z.boolean().default(false),
  laundryRequired: z.boolean().default(false),
  securityRequired: z.boolean().default(false),
  quietHours: z.boolean().default(false),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  petFriendly: z.boolean().default(false),
  smokingAllowed: z.boolean().default(false),
  notes: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onSuccess?: (data: RegistrationFormData) => void;
  onCancel?: () => void;
}

const GENDERS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác / Không xác định" },
];

const ID_TYPES = [
  { value: "cccd", label: "Căn cước công dân" },
  { value: "passport", label: "Hộ chiếu" },
  { value: "other", label: "Giấy tờ khác" },
];

const ROOM_TYPES = [
  { value: "whole-room", label: "Thuê nguyên phòng" },
  { value: "shared-room", label: "Thuê giường ở ghép" },
];

const RENTAL_TYPES = [
  { value: "short-term", label: "Thuê ngắn hạn" },
  { value: "long-term", label: "Thuê dài hạn" },
  { value: "semester", label: "Thuê theo học kỳ" },
  { value: "yearly", label: "Thuê theo năm" },
];

const RENTAL_DURATIONS = [
  { value: "1-month", label: "1 tháng" },
  { value: "3-months", label: "3 tháng" },
  { value: "6-months", label: "6 tháng" },
  { value: "12-months", label: "12 tháng" },
  { value: "flexible", label: "Linh hoạt" },
];

const AREAS = [
  { value: "area-a", label: "Khu vực A" },
  { value: "area-b", label: "Khu vực B" },
  { value: "area-c", label: "Khu vực C" },
  { value: "area-d", label: "Khu vực D" },
];

const PRICE_RANGES = [
  { value: "1-3m", label: "1 - 3 triệu VNĐ" },
  { value: "3-5m", label: "3 - 5 triệu VNĐ" },
  { value: "5-7m", label: "5 - 7 triệu VNĐ" },
  { value: "7-10m", label: "7 - 10 triệu VNĐ" },
  { value: "10m+", label: "> 10 triệu VNĐ" },
];

export function RegistrationForm({ initialData, onSuccess, onCancel }: RegistrationFormProps) {
  const { user } = useAuth();
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    getValues,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onBlur",
    defaultValues: {
      gender: "male",
      idType: "cccd",
      roomType: "whole-room",
      rentalType: "short-term",
      rentalDuration: "1-month",
      desiredArea: "area-a",
      priceRange: "1-3m",
      parkingRequired: false,
      acRequired: false,
      wifiRequired: false,
      kitchenRequired: false,
      gymRequired: false,
      laundryRequired: false,
      securityRequired: false,
      quietHours: false,
      petFriendly: false,
      smokingAllowed: false,
      notes: "",
    },
  });

  const watchQuietHours = watch("quietHours");

  const onSubmit: SubmitHandler<RegistrationFormData> = async (data) => {
    try {
      const response = await registrationService.create(data, user?.maNV);

      toast.success("Phiếu đăng ký được tạo thành công!", {
        description: `Mã đăng ký: ${response.registrationNumber}`,
      });

      if (onSuccess) {
        onSuccess(data as RegistrationFormData);
      }
      reset();
    } catch (error) {
      toast.error("Lỗi khi tạo phiếu đăng ký", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau",
      });
    }
  };


  const submitForm = handleSubmit((data: RegistrationFormData) => {
    void onSubmit(data);
  });

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-gray-50">
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <form onSubmit={submitForm} className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col mb-2">
            <h1 className="text-xl font-bold text-gray-900">Lập phiếu đăng ký dịch vụ</h1>
            <p className="text-xs text-gray-500 mt-0.5">Tạo phiếu đăng ký cho khách hàng mới</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 1: Thông tin cá nhân */}
            <Card className="h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Thông tin cá nhân khách hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Tên khách hàng */}
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-sm font-medium">
                      Tên khách hàng <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="customerName"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="customerName"
                          placeholder="Nhập tên khách hàng"
                          className={errors.customerName ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.customerName && (
                      <p className="text-sm text-red-500">{errors.customerName.message}</p>
                    )}
                  </div>

                  {/* Giới tính */}
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">
                      Giới tính <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="gender"
                            className={errors.gender ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENDERS.map((gender) => (
                              <SelectItem key={gender.value} value={gender.value}>
                                {gender.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.gender && (
                      <p className="text-sm text-red-500">{errors.gender.message}</p>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="phone"
                          placeholder="0987654321"
                          className={errors.phone ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="khach@example.com"
                          className={errors.email ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                  </div>

                  {/* Địa chỉ */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Địa chỉ <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="address"
                          placeholder="Nhập địa chỉ hiện tại"
                          className={errors.address ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address.message}</p>
                    )}
                  </div>

                  {/* Loại giấy tờ */}
                  <div className="space-y-2">
                    <Label htmlFor="idType" className="text-sm font-medium">
                      Loại giấy tờ tùy thân <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="idType"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="idType"
                            className={errors.idType ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Chọn loại giấy tờ" />
                          </SelectTrigger>
                          <SelectContent>
                            {ID_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.idType && (
                      <p className="text-sm text-red-500">{errors.idType.message}</p>
                    )}
                  </div>

                  {/* Số giấy tờ */}
                  <div className="space-y-2">
                    <Label htmlFor="idNumber" className="text-sm font-medium">
                      Số giấy tờ <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="idNumber"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="idNumber"
                          placeholder="Nhập số giấy tờ"
                          className={errors.idNumber ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.idNumber && (
                      <p className="text-sm text-red-500">{errors.idNumber.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Thông tin lưu trú */}
            <Card className="h-fit">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Thông tin lưu trú</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Số người ở */}
                  <div className="space-y-2">
                    <Label htmlFor="numberOfPeople" className="text-sm font-medium">
                      Số người ở <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="numberOfPeople"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="numberOfPeople"
                            className={errors.numberOfPeople ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Chọn số người" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} người
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.numberOfPeople && (
                      <p className="text-sm text-red-500">{errors.numberOfPeople.message}</p>
                    )}
                  </div>

                  {/* Loại phòng */}
                  <div className="space-y-2">
                    <Label htmlFor="roomType" className="text-sm font-medium">
                      Loại phòng <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="roomType"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="roomType"
                            className={errors.roomType ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Chọn loại phòng" />
                          </SelectTrigger>
                          <SelectContent>
                            {ROOM_TYPES.map((room) => (
                              <SelectItem key={room.value} value={room.value}>
                                {room.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.roomType && (
                      <p className="text-sm text-red-500">{errors.roomType.message}</p>
                    )}
                  </div>

                  {/* Loại hình thuê */}
                  <div className="space-y-2">
                    <Label htmlFor="rentalType" className="text-sm font-medium">
                      Loại hình thuê <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="rentalType"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="rentalType"
                            className={errors.rentalType ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Chọn loại hình thuê" />
                          </SelectTrigger>
                          <SelectContent>
                            {RENTAL_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.rentalType && (
                      <p className="text-sm text-red-500">{errors.rentalType.message}</p>
                    )}
                  </div>

                  {/* Thời hạn thuê */}
                  <div className="space-y-2">
                    <Label htmlFor="rentalDuration" className="text-sm font-medium">
                      Thời hạn thuê <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="rentalDuration"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="rentalDuration"
                            className={errors.rentalDuration ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Chọn thời hạn" />
                          </SelectTrigger>
                          <SelectContent>
                            {RENTAL_DURATIONS.map((duration) => (
                              <SelectItem key={duration.value} value={duration.value}>
                                {duration.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.rentalDuration && (
                      <p className="text-sm text-red-500">{errors.rentalDuration.message}</p>
                    )}
                  </div>

                  {/* Khu vực mong muốn */}
                  <div className="space-y-2">
                    <Label htmlFor="desiredArea" className="text-sm font-medium">
                      Khu vực mong muốn <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="desiredArea"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="desiredArea"
                            className={errors.desiredArea ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Chọn khu vực" />
                          </SelectTrigger>
                          <SelectContent>
                            {AREAS.map((area) => (
                              <SelectItem key={area.value} value={area.value}>
                                {area.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.desiredArea && (
                      <p className="text-sm text-red-500">{errors.desiredArea.message}</p>
                    )}
                  </div>

                  {/* Mức giá */}
                  <div className="space-y-2">
                    <Label htmlFor="priceRange" className="text-sm font-medium">
                      Mức giá mong muốn <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="priceRange"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger
                            id="priceRange"
                            className={errors.priceRange ? "border-red-500" : ""}
                          >
                            <SelectValue placeholder="Chọn mức giá" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRICE_RANGES.map((range) => (
                              <SelectItem key={range.value} value={range.value}>
                                {range.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.priceRange && (
                      <p className="text-sm text-red-500">{errors.priceRange.message}</p>
                    )}
                  </div>

                  {/* Ngày dự kiến vào ở */}
                  <div className="space-y-2">
                    <Label htmlFor="moveInDate" className="text-sm font-medium">
                      Ngày dự kiến vào ở <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="moveInDate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="moveInDate"
                          type="date"
                          className={errors.moveInDate ? "border-red-500" : ""}
                        />
                      )}
                    />
                    {errors.moveInDate && (
                      <p className="text-sm text-red-500">{errors.moveInDate.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 3: Tiêu chí và yêu cầu khách hàng */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Tiêu chí và yêu cầu khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tiện nghi yêu cầu */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Tiện nghi yêu cầu</Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {/* Gửi xe */}
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="parkingRequired"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="parking"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="parking" className="text-sm cursor-pointer font-normal">
                      Gửi xe
                    </Label>
                  </div>

                  {/* Điều hòa */}
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="acRequired"
                      control={control}
                      render={({ field }) => (
                        <Checkbox id="ac" checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <Label htmlFor="ac" className="text-sm cursor-pointer font-normal">
                      Điều hòa
                    </Label>
                  </div>

                  {/* WiFi */}
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="wifiRequired"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="wifi"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="wifi" className="text-sm cursor-pointer font-normal">
                      WiFi miễn phí
                    </Label>
                  </div>

                  {/* Bếp chung */}
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="kitchenRequired"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="kitchen"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="kitchen" className="text-sm cursor-pointer font-normal">
                      Bếp chung
                    </Label>
                  </div>

                  {/* Phòng tập */}
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="gymRequired"
                      control={control}
                      render={({ field }) => (
                        <Checkbox id="gym" checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <Label htmlFor="gym" className="text-sm cursor-pointer font-normal">
                      Phòng tập
                    </Label>
                  </div>

                  {/* Giặt sấy */}
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="laundryRequired"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="laundry"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="laundry" className="text-sm cursor-pointer font-normal">
                      Giặt sấy
                    </Label>
                  </div>

                  {/* Bảo vệ 24/7 */}
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="securityRequired"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="security"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="security" className="text-sm cursor-pointer font-normal">
                      Bảo vệ 24/7
                    </Label>
                  </div>

                  {/* Thân thiện với thú cưng */}
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="petFriendly"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="petFriendly"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor="petFriendly" className="text-sm cursor-pointer font-normal">
                      Thân thiện với thú cưng
                    </Label>
                  </div>
                </div>
              </div>

              {/* Yêu cầu sinh hoạt */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="quietHours"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="quietHours"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="quietHours" className="text-sm font-medium cursor-pointer">
                    Yêu cầu giờ giấc sinh hoạt / Yên tĩnh
                  </Label>
                </div>

                {/* Quiet hours time pickers */}
                {watchQuietHours && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 ml-6 p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="quietHoursStart" className="text-sm">
                        Giờ bắt đầu yên tĩnh
                      </Label>
                      <Controller
                        name="quietHoursStart"
                        control={control}
                        render={({ field }) => (
                          <Input {...field} id="quietHoursStart" type="time" placeholder="22:00" />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quietHoursEnd" className="text-sm">
                        Giờ kết thúc yên tĩnh
                      </Label>
                      <Controller
                        name="quietHoursEnd"
                        control={control}
                        render={({ field }) => (
                          <Input {...field} id="quietHoursEnd" type="time" placeholder="08:00" />
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Cho phép hút thuốc */}
                <div className="flex items-center space-x-2">
                  <Controller
                    name="smokingAllowed"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="smoking"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="smoking" className="text-sm cursor-pointer font-normal">
                    Cho phép hút thuốc trong phòng
                  </Label>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Ghi chú thêm
                </Label>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      id="notes"
                      placeholder="Nhập ghi chú thêm của khách hàng (yêu cầu đặc biệt, trao đổi thêm, v.v.)..."
                      className="w-full min-h-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Moved inside the scrollable form */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-t border-gray-200 pt-6">
            <div className="text-xs text-gray-500">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Ctrl</kbd>
              <span className="mx-1">+</span>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Enter</kbd>
              <span className="ml-2">: Tạo phiếu đăng ký</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  reset();
                  if (onCancel) onCancel();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>

              <Button
                onClick={submitForm}
                disabled={isSubmitting}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                title="Tạo phiếu (Ctrl+Enter)"
              >
                {isSubmitting ? "Đang tạo..." : "Tạo phiếu đăng ký"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
