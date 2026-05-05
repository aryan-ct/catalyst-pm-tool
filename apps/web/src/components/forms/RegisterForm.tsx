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
import { useNavigate } from "react-router-dom";
import { UserPlus, ShieldCheck, Mail, Lock, User } from "lucide-react";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Abstract background elements */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute top-[-5%] left-[10%] w-[30%] h-[30%] bg-blue-50/60 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[460px] px-4">
        <div className="flex items-center justify-center mb-8 gap-2">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Catalyst</h1>
        </div>

        <Card className="rounded-2xl border-slate-200 shadow-xl bg-white/80 backdrop-blur-sm p-2">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Create your account
            </CardTitle>
            <CardDescription className="text-slate-500">
              Join Catalyst PM Tool and start managing your projects efficiently
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium ml-1">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="John Doe"
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium ml-1">Work email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium ml-1">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium ml-1">Confirm</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                      value={form.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-blue-200 mt-2"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create Account
                </div>
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <button type="button" onClick={() => navigate("/")} className="text-blue-600 font-bold hover:underline">
                    Login here
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-400 text-xs mt-8">
          By signing up, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}