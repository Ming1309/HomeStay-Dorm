import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Building2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useAuth, type CurrentUser } from "@/features/auth/model/auth-store";
import { roleMeta } from "@/app/navigation/appNavigation";

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập đầy đủ thông tin"),
  password: z.string().min(1, "Vui lòng nhập đầy đủ thông tin"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    const response = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenDangNhap: data.username, matKhau: data.password }),
    });
    if (!response.ok) {
      toast.error(response.status === 423 ? "Tài khoản đã bị khóa." : "Tên đăng nhập hoặc mật khẩu không chính xác.");
      return;
    }
    const user = await response.json() as CurrentUser;
    const normalized = { ...user, role: ({ Sale: "sale", KeToan: "accountant", QuanLy: "manager", QuanTri: "admin" } as Record<string, CurrentUser["role"]>)[user.vaiTro] };
    setUser(normalized);
    toast.success("Đăng nhập thành công");
    navigate({ to: roleMeta[normalized.role].home });
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-100 p-8 space-y-8">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner mb-2"><Building2 className="text-white size-6" /></div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">HomeStay Dorm Management</h1>
          <p className="text-sm text-gray-500">Đăng nhập để quản lý hệ thống lưu trú</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5"><Label htmlFor="username" className="text-gray-700 font-medium">Tên đăng nhập</Label><Input id="username" placeholder="Nhập tên đăng nhập" className={`h-11 ${errors.username ? "border-red-500" : ""}`} {...register("username")} />{errors.username && <p className="text-xs font-medium text-red-500 mt-1">{errors.username.message}</p>}</div>
          <div className="space-y-1.5"><Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu</Label><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu" className={`h-11 pr-10 ${errors.password ? "border-red-500" : ""}`} {...register("password")} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div>{errors.password && <p className="text-xs font-medium text-red-500 mt-1">{errors.password.message}</p>}</div>
          <Button type="submit" disabled={isSubmitting} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base font-semibold">{isSubmitting ? "Đang xác thực..." : "Đăng nhập"}</Button>
        </form>
      </div>
    </div>
  );
}
