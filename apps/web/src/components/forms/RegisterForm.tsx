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

export default function RegisterForm() {
    const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log(form);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      
      <Card className="w-[420px] rounded-2xl shadow-xl border border-blue-100 bg-white">
        
        <CardHeader className="text-center space-y-2 pb-6">
          <CardTitle className="text-2xl font-semibold text-blue-600">
            Create Account
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Fill in your details to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-11 border-gray-300 
              focus-visible:ring-2 focus-visible:ring-blue-500 
              focus-visible:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-11 border-gray-300 
              focus-visible:ring-2 focus-visible:ring-blue-500 
              focus-visible:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="h-11 border-gray-300 
              focus-visible:ring-2 focus-visible:ring-blue-500 
              focus-visible:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(e) =>
                handleChange("confirmPassword", e.target.value)
              }
              className="h-11 border-gray-300 
              focus-visible:ring-2 focus-visible:ring-blue-500 
              focus-visible:border-blue-500"
            />
          </div>

          <Button
            className="w-full h-11 bg-blue-600 text-white 
            hover:bg-blue-700 active:scale-[0.98] transition-all"
            onClick={handleSubmit}
          >
            SIGN UP
          </Button>

          <div className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate("/")}>
              Login
            </span>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}