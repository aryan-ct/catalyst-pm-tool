import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/api/axios-instance";
import { useAuth } from "@/context/AuthContext";
import { LogIn, ShieldCheck, Mail, Lock } from "lucide-react";

export default function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/auth/login", form);
      const { token } = response.data;
      await login(token);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[440px] px-4">
        <div className="flex items-center justify-center mb-8 gap-2">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Catalyst</h1>
        </div>

        <Card className="rounded-2xl border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm p-2">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-slate-500">
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium ml-1">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-slate-700 font-medium">Password</Label>
                  <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm py-3 px-4 rounded-xl font-medium flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-600 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-blue-200"
              >
                {loading ? (
                   <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                   </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </div>
                )}
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-slate-500">
                  Don't have an account?{" "}
                  <button type="button" className="text-blue-600 font-bold hover:underline">
                    Contact your HR
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-slate-400 text-xs mt-8">
          © 2026 Catalyst PM Tool. All rights reserved.
        </p>
      </div>
    </div>
  );
}