import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { setTokens } from "@/lib/auth";
import { api } from "@/lib/api";

const loginSchema = z.object({
  username: z.string().min(5, "Username kamida 5 ta harf bo‘lsin"),
  password: z.string().min(2, "Password kamida 7 ta belgidan iborat bo‘lsin"),
});

type LoginValues = z.infer<typeof loginSchema>;

type LoginResponse = {
  access: string;
  refresh?: string;
  user?: {
    id: number;
    username: string;
    full_name?: string;
    phone?: string;
    email?: string;
  };
};

type MeResponse = {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  [key: string]: any;
};

export default function LoginPage() {
  const vantaRef = useRef<HTMLDivElement | null>(null);
  const vantaEffectRef = useRef<any>(null);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const { register, handleSubmit, formState } = form;
  const { errors } = formState;

  // ===== VANTA =====
  useEffect(() => {
    const three = document.createElement("script");
    three.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";

    const vanta = document.createElement("script");
    vanta.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js";

    document.body.appendChild(three);
    document.body.appendChild(vanta);

    vanta.onload = () => {
      // @ts-ignore
      if (window.VANTA && vantaRef.current) {
        // @ts-ignore
        vantaEffectRef.current = window.VANTA.WAVES({
          el: vantaRef.current,
          color: 0x14add6,
          backgroundColor: 0x384295,
          waveHeight: 20,
          waveSpeed: 1.2,
          zoom: 1.05,
        });
      }
    };

    return () => {
      vantaEffectRef.current?.destroy?.();
      // ixtiyoriy: scriptlarni ham olib tashlash
      try {
        document.body.removeChild(three);
        document.body.removeChild(vanta);
      } catch { }
    };
  }, []);

  // ===== API =====
  const loginRequest = async (values: LoginValues) => {
    // Siz bergan: http://77.83.206.97/api/v1/accounts/login/
    // api baseURL: http://77.83.206.97
    const res = await api.post<LoginResponse>("/api/v1/accounts/login/", values);
    return res.data;
  };

  const fetchMe = async () => {
    const res = await api.get<MeResponse>("/api/v1/accounts/me/");
    return res.data;
  };

  // ===== LOGIN =====
  const onSubmit = async (values: LoginValues) => {
    setLoading(true);
    try {
      const { access, refresh, user } = await loginRequest(values);

      // token saqlaymiz
      setTokens(access, refresh);

      // user info
      const me = user ?? (await fetchMe());
      localStorage.setItem("erp_user", JSON.stringify(me));

      toast.success("Login muvaffaqiyatli ✅");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        toast.error("Username yoki parol noto‘g‘ri ❌");
      } else if (status === 400) {
        toast.error("Ma’lumotlar noto‘g‘ri yuborildi ❌");
      } else if (status === 429) {
        toast.error("Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.");
      } else {
        toast.error("Serverda xatolik ❌");
      }

      console.log("LOGIN ERROR:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <div ref={vantaRef} className="absolute inset-0 -z-10" />

      <div className="min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-[360px] bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-white space-y-4"
        >
          <h1 className="text-2xl text-center">ERP Login</h1>

          <Input placeholder="Username" {...register("username")} />
          {errors.username && (
            <p className="text-sm text-yellow-300">{errors.username.message}</p>
          )}

          <Input type="password" placeholder="Password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-yellow-300">{errors.password.message}</p>
          )}

          <button
            disabled={loading}
            className="w-full h-11 rounded-xl bg-blue-600 disabled:opacity-60"
          >
            {loading ? "Kutilmoqda..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
