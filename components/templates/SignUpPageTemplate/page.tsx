"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AuthService } from "@/services";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPageTemplate() {

  const authService = new AuthService()
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  //   const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate required fields
    if (!name || !email || !password || !terms) {
      alert("Please fill all fields and agree to terms.");
      return;
    }

    // ✅ Log payload
    const payload = {
      full_name: name,
      email,
      //   role,
      password,
      // terms,
    };
    console.log("✅ Form submitted:", payload);

    const response = authService.register(payload)



    // TODO: Send to API
    // await fetch("/api/signup", { method: "POST", body: JSON.stringify(payload) })

    // Simulate success
    alert("Account created successfully!");
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-6 bg-white dark:bg-zinc-900 shadow-xl z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-2">
            <img
              alt="Fatima Marketing Logo"
              className="h-32 w-auto mb-2"
              src={"/FatimaMarketingLogo.png"}
            />
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium tracking-wide uppercase">
              Real Services for Real Estate
            </p>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Create an Account
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Join the elite platform for real estate marketing and property
              management.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                htmlFor="name"
              >
                Full Name
              </label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Role */}
            {/* <div>
              <label
                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                htmlFor="role"
              >
                User Role
              </label>
              <div className="relative">
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white appearance-none">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Real Estate Agent</SelectItem>
                    <SelectItem value="manager">Property Manager</SelectItem>
                    <SelectItem value="marketer">Marketer</SelectItem>
                    <SelectItem value="investor">Investor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div> */}

            {/* Password */}
            <div>
              <label
                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <PasswordInput
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={terms}
                onCheckedChange={(checked) => setTerms(checked === true)}
              />
              <label
                htmlFor="terms"
                className="block text-sm text-zinc-600 dark:text-zinc-400"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="text-zinc-900 dark:text-white font-semibold underline decoration-yellow-500 underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-zinc-900 dark:text-white font-semibold underline decoration-yellow-500 underline-offset-4 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full cursor-pointer text-white">
              <span>Create Account</span>
            </Button>
          </form>

          <p className="mt-8 text-center text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-zinc-900 dark:text-white font-bold hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>

      {/* Right Hero */}
      <div className="hidden lg:block lg:w-1/2 relative bg-zinc-900 overflow-hidden">
        <img
          alt="Modern Luxury Real Estate"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRFPTg6LFpF8AqAe1MN2V3zikQLeQRTMMAsvawkoZsrqhUbS7pzO8QoRrHnnu1x0630LHYZ4Xg69xS429Ar-HZCInbbVGPzFx53qQYoyjHRglwxPFRhNBuR9FcG1xRae5oXegHCBsi7jtJF7u0g4TF8K1EmjRhcRYw6hD2oabsMeNBSI5XPOAy7iAnBhiK4ShKP7N_7bl3eHDpRZaHIVqlekQBRq_BiBqLCnsP7TlKETnhoVGoSZU2dro3fibztBKdVNovQfjXuus"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80"></div>
        <div className="absolute bottom-0 left-0 p-16 text-white max-w-xl">
          <div className="flex items-center space-x-2 mb-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            <span className="text-yellow-500 font-bold tracking-widest uppercase text-sm">
              Join 5,000+ Professionals
            </span>
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Elevate your real estate marketing game today.
          </h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white/90 p-2 rounded-lg backdrop-blur-md">
                <span className="material-icons text-primary">analytics</span>
              </div>
              <div>
                <h4 className="font-bold text-lg">Advanced Analytics</h4>
                <p className="text-zinc-300 text-sm">
                  Track property performance and marketing reach in real-time.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white/90 p-2 rounded-lg backdrop-blur-md">
                <span className="material-icons text-primary">campaign</span>
              </div>
              <div>
                <h4 className="font-bold text-lg">Seamless Campaigns</h4>
                <p className="text-zinc-300 text-sm">
                  Launch multi-channel marketing campaigns with a single click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
