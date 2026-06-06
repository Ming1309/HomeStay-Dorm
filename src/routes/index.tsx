import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkflowStore } from "@/lib/workflow-store";

export const Route = createFileRoute("/")({
  component: LoginScreen,
});

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập đầy đủ thông tin"),
  password: z.string().min(1, "Vui lòng nhập đầy đủ thông tin"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginScreen() {
  const navigate = useNavigate();
  const { setRole } = useWorkflowStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    const { username } = data;

    // Sub-flow A4: Wrong credentials
    if (username === "wrong") {
      toast.error("Tên đăng nhập hoặc mật khẩu không chính xác.");
      return;
    }

    // Sub-flow A5: Locked account
    if (username === "locked") {
      toast.error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
      return;
    }

    // Successful login & Role-Based Routing
    toast.success("Đăng nhập thành công");

    switch (username) {
      case "sale":
        setRole("sale");
        navigate({ to: "/sale/dashboard" });
        break;
      case "ketoan":
        setRole("accountant");
        navigate({ to: "/accountant" });
        break;
      case "quanly":
        setRole("manager");
        navigate({ to: "/manager" });
        break;
      case "admin":
        setRole("admin");
        navigate({ to: "/admin" });
        break;
      default:
        setRole("sale");
        navigate({ to: "/sale/dashboard" });
        break;
    }
  };

  const autofillAndSubmit = (role: string) => {
    setValue("username", role);
    setValue("password", "password123");
    handleSubmit(onSubmit)();
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-100 p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner mb-2">
            <Building2 className="text-white size-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            HomeStay Dorm Management
          </h1>
          <p className="text-sm text-gray-500">Đăng nhập để quản lý hệ thống lưu trú</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-gray-700 font-medium">
              Tên đăng nhập
            </Label>
            <Input
              id="username"
              placeholder="Nhập tên đăng nhập"
              className={`h-11 ${errors.username ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-blue-500"}`}
              {...register("username")}
            />
            {errors.username && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-gray-700 font-medium">
              Mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                className={`h-11 pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-blue-500"}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base font-semibold"
          >
            Đăng nhập
          </Button>
        </form>

        {/* Demo Tool */}
        <div className="pt-6 mt-6 border-t border-dashed border-gray-200">
          <div className="text-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Test Accounts (Demo)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => autofillAndSubmit("sale")}
              className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
            >
              Login as Sale
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => autofillAndSubmit("ketoan")}
              className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
            >
              Login as Kế toán
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => autofillAndSubmit("quanly")}
              className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
            >
              Login as Quản lý
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => autofillAndSubmit("admin")}
              className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
            >
              Login as Quản trị
            </Button>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => autofillAndSubmit("wrong")}
              className="text-[10px] h-6 px-2 text-gray-400 hover:text-red-600"
            >
              Test Wrong Creds
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => autofillAndSubmit("locked")}
              className="text-[10px] h-6 px-2 text-gray-400 hover:text-red-600"
            >
              Test Locked
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
