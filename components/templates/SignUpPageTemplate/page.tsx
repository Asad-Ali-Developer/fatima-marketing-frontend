"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AuthService } from "@/services";
import { cn } from "@/lib/utils";
import { BarChart3, Megaphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

const glassInputClass = cn(
  "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/40",
  "bg-white/10 border border-white/20 backdrop-blur-md",
  "outline-none focus:border-[#00B7E8] focus:ring-2 focus:ring-[#00B7E8]/30",
  "transition-all duration-300",
);

export default function SignUpPageTemplate() {
  const router = useRouter();
  const authService = new AuthService();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !terms) {
      toast.error("Please fill all fields and agree to terms.");
      return;
    }

    const role = {
      role_type: "super_admin",
    };

    const payload = {
      full_name: name,
      email,
      role: role,
      password,
      rokra: "60k",
    };

    setIsSubmitting(true);
    try {
      const response = await authService.register(payload);
      if (response?.status) {
        toast.success("Account created successfully!");
        router.push("/signin");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#0a1420]">
      {/* Background image */}
      <img
        alt="Modern Luxury Real Estate"
        className="absolute inset-0 h-full w-full object-cover"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRFPTg6LFpF8AqAe1MN2V3zikQLeQRTMMAsvawkoZsrqhUbS7pzO8QoRrHnnu1x0630LHYZ4Xg69xS429Ar-HZCInbbVGPzFx53qQYoyjHRglwxPFRhNBuR9FcG1xRae5oXegHCBsi7jtJF7u0g4TF8K1EmjRhcRYw6hD2oabsMeNBSI5XPOAy7iAnBhiK4ShKP7N_7bl3eHDpRZaHIVqlekQBRq_BiBqLCnsP7TlKETnhoVGoSZU2dro3fibztBKdVNovQfjXuus"
      />

      {/* Darkening gradient so the glass card reads clearly */}
      <div className="absolute inset-0 bg-gradient-to-bl from-black/70 via-black/50 to-black/85" />

      {/* Ambient color blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#00B7E8]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-amber-400/15 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/4 h-72 w-72 rounded-full bg-[#00B7E8]/10 blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen w-full flex-col lg:flex-row-reverse">
        {/* Right (visually): Hero copy — hidden on small screens */}
        <div className="hidden lg:flex lg:w-3/5 flex-col justify-end p-16 text-white">
          <div className="mb-4 flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-500 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow-500" />
            </span>
            <span className="text-sm font-bold uppercase tracking-widest text-yellow-500">
              Join 5,000+ Professionals
            </span>
          </div>
          <h2 className="mb-8 max-w-xl text-4xl font-bold leading-tight xl:text-5xl">
            Elevate your real estate marketing game today.
          </h2>
          <div className="max-w-lg space-y-6">
            <div className="flex items-start space-x-4">
              <div className="rounded-lg border border-white/20 bg-white/10 p-2 backdrop-blur-md">
                <BarChart3 className="h-5 w-5 text-[#00B7E8]" />
              </div>
              <div>
                <h4 className="text-lg font-bold">Advanced Analytics</h4>
                <p className="text-sm text-white/60">
                  Track property performance and marketing reach in real-time.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="rounded-lg border border-white/20 bg-white/10 p-2 backdrop-blur-md">
                <Megaphone className="h-5 w-5 text-[#00B7E8]" />
              </div>
              <div>
                <h4 className="text-lg font-bold">Seamless Campaigns</h4>
                <p className="text-sm text-white/60">
                  Launch multi-channel marketing campaigns with a single click.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Left (visually): Glass form panel */}
        <div className="flex w-full flex-1 items-center justify-center p-4 sm:p-6 lg:w-2/5 lg:p-12">
          <div
            className={cn(
              "w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-10",
              "shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-2xl",
            )}
          >
            <div className="mb-2">
              <img
                alt="Fatima Marketing Logo"
                className="mb-3 h-20 w-auto object-contain sm:h-24"
                src="/FatimaMarketingLogo.png"
              />
              <p className="text-xs font-medium uppercase tracking-widest text-white/50">
                Real Services for Real Estate
              </p>
            </div>

            <div className="mb-8">
              <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                Create an Account
              </h1>
              <p className="text-sm text-white/60">
                Join the elite platform for real estate marketing and property
                management.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label
                  className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/60"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={glassInputClass}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/60"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={glassInputClass}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/60"
                  htmlFor="password"
                >
                  Password
                </label>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={glassInputClass}
                />
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={terms}
                  className="mt-0.5 h-4.5 w-4.5 border-white/40 data-[state=checked]:border-[#00B7E8] data-[state=checked]:bg-[#00B7E8]"
                  onCheckedChange={(checked) => setTerms(checked === true)}
                />
                <label
                  htmlFor="terms"
                  className="block text-xs text-white/60 lg:text-sm"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="font-semibold text-white underline decoration-[#00B7E8] decoration-2 underline-offset-4 transition-colors hover:text-[#00B7E8]"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="font-semibold text-white underline decoration-[#00B7E8] decoration-2 underline-offset-4 transition-colors hover:text-[#00B7E8]"
                  >
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full cursor-pointer rounded-xl bg-[#00B7E8] py-3 text-white",
                  "shadow-[0_4px_20px_rgba(0,183,232,0.4)] transition-all duration-300",
                  "hover:bg-[#00a5d1] hover:shadow-[0_4px_25px_rgba(0,183,232,0.55)]",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-white/60">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-medium text-[#00B7E8] transition-colors hover:text-white"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
