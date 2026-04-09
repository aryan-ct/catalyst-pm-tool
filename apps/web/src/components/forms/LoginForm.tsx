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

export default function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState<Boolean>(false)

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

  const handleShowPassword=(e:React.ChangeEvent<HTMLInputElement>)=>{
    setShowPassword(e.target.checked)
  }
  return (
   <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200">
  
  <Card className="w-[420px] rounded-2xl shadow-xl border border-blue-100 bg-white">
    
    <CardHeader className="text-center space-y-2 pb-6">
      <CardTitle className="text-2xl font-semibold text-blue-600">
        Login
      </CardTitle>
      <CardDescription className="text-sm text-gray-500">
        Enter your credentials to continue
      </CardDescription>
    </CardHeader>

    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-gray-700">Email</Label>
        <Input
          type="email"
          placeholder="Enter your email"
          className="h-11 rounded-md border-gray-300 
          focus-visible:ring-2 focus-visible:ring-blue-500 
          focus-visible:border-blue-500 transition"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-gray-700">Password</Label>
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          className="h-11 rounded-md border-gray-300 
          focus-visible:ring-2 focus-visible:ring-blue-500 
          focus-visible:border-blue-500 transition"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" onChange={handleShowPassword}/>
        <span className="text-sm text-gray-600">Show Password</span>
      </div>

      {error && (
        <p className="text-sm text-red-500 font-medium">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-md bg-blue-600 text-white 
        hover:bg-blue-700 active:scale-[0.98] transition-all"
      >
        {loading ? "Signing in..." : "SIGN IN"}
      </Button>

      <div className="text-center space-y-2 pt-2">
        <p className="text-sm text-gray-500 hover:text-blue-600 hover:underline cursor-pointer">
          Forgot Username / Password?
        </p>
        {/* <p className="text-sm text-gray-500">
          Don’t have an account?{" "}
          <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => navigate("/register")}>
            Sign up
          </span>
        </p> */}
      </div>
      </form>
    </CardContent>
  </Card>
</div>
  );
}