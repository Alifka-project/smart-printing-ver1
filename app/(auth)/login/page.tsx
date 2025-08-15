"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUser } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { dummyUsers } from "@/constants/dummyusers";
import { Eye, EyeOff, Terminal, TerminalIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");

  const handleLogin = () => {
    const found = dummyUsers.find((u) => u.email === email && u.password === password);
    if (!found) {
      setErr("Invalid email or password");
      return;
    }
    setUser(found);
    router.push("/"); // masuk ke (dashboard)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 border-2 border-gray-800 rounded flex items-center justify-center">
                <TerminalIcon className="w-4 h-4 text-gray-800" />
              </div>
              <span className="text-lg font-semibold text-gray-800">Printing</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-sm">Please sign in to continue.</p>
          </div>

          {/* Error Message */}
          {err && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{err}</p>
            </div>
          )}

          {/* Login Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eg. EMP001"
                className="w-full px-4 py-5 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-5 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-5 px-4 rounded-sm transition-colors  duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Login
            </Button>
          </div>
        </div>
      </div>

      {/* Right side - Design/Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-sm flex items-center justify-center mb-6">
              <Terminal className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Printing Management</h2>
            <p className="text-xl text-blue-100 max-w-md">
              Streamline your printing operations with our comprehensive management system
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="flex justify-center space-x-4 opacity-60">
            <div className="w-16 h-16 bg-white/20 rounded-full"></div>
            <div className="w-12 h-12 bg-white/20 rounded-full mt-2"></div>
            <div className="w-20 h-20 bg-white/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}