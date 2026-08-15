"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AuthService } from "@/services";
import { setUser } from "@/store/slices";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

export default function SignInPageTemplate() {
  const authService = new AuthService();
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = { email, password, rememberMe };
      const response = await authService.login(payload);

      if (!response?.data) return;

      toast.success("Login successful!");
      dispatch(setUser({ user: response.data.user }));
      router.push("/");
    } catch (error) {
      toast.error("Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a1420]">
      {/* Background image */}
      <img
        alt="Luxury modern real estate architecture"
        className="absolute inset-0 h-full w-full object-cover"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHjHBbR2nhjvm8eFzAFPOVbhU9Rzhynmo85AEP4j7a9lesXFKtMV__WlATnikQ1LuqohziS1vO4qRZUAVQphv7BffKHB6p0J9lHLtG-yowD_lmrNEyrNWvf7sHJuHCGuPoRvffU_uCdetOOzxc76ZqUhweJoWfyYmyJXgECKdjD4bI_P-G6RDVVYvR4PrESqw_j2kyxOyhhoRb_8__0cCpNv5K5lp59ySAwWJy2R56fMnsW5G1rgp56GCw8euvrcMM7y3nzAaETYo"
      />

      {/* Base darkening + gradient so the glass card reads clearly everywhere */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/80" />

      {/* Ambient color blobs for depth */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#00B7E8]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-[#00B7E8]/10 blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen w-full flex-col lg:flex-row">
        {/* Left: Brand copy — hidden on small screens */}
        <div className="hidden lg:flex lg:w-3/5 flex-col justify-end p-16 text-white">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-1 w-12 rounded-full bg-[#00B7E8]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#00B7E8]">
              Fatima Marketing Premium
            </span>
          </div>
          <h1 className="mb-4 max-w-xl text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
            Elevating Real Estate <br /> Through Strategic Marketing.
          </h1>
          <p className="max-w-lg text-lg text-white/70">
            Access our enterprise-grade property management suite and marketing
            tools designed for the modern agent.
          </p>
        </div>

        {/* Right: Glass form panel */}
        <div className="flex w-full flex-1 items-center justify-center p-4 sm:p-6 lg:w-2/5 lg:p-12">
          <div
            className={cn(
              "w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-10",
              "shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-lg backdrop-saturate-150 transition-all duration-300",
            )}
          >
            <div className="mb-8 text-center lg:text-left">
              <img
                alt="Fatima Marketing Logo"
                className="mx-auto mb-6 h-24 w-auto object-contain sm:h-28 lg:mx-0"
                src="/FatimaMarketingLogo.png"
              />
              <h2 className="mb-2 text-2xl font-extrabold text-white sm:text-3xl">
                Welcome Back
              </h2>
              <p className="text-sm text-white/60">
                Please enter your details to sign in.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold uppercase tracking-widest text-white/60"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/40",
                      "bg-white/10 border border-white/20 backdrop-blur-md",
                      "outline-none focus:border-[#00B7E8] focus:ring-2 focus:ring-[#00B7E8]/30",
                      "transition-all duration-300",
                    )}
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold uppercase tracking-widest text-white/60"
                    >
                      Password
                    </label>
                  </div>
                  <PasswordInput
                    id="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/40",
                      "bg-white/10 border border-white/20 backdrop-blur-md",
                      "outline-none focus:border-[#00B7E8] focus:ring-2 focus:ring-[#00B7E8]/30",
                      "transition-all duration-300",
                    )}
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  className="h-4.5 w-4.5 border-white/40 data-[state=checked]:bg-[#00B7E8] data-[state=checked]:border-[#00B7E8]"
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <label htmlFor="remember-me" className="text-sm text-white/70">
                  Remember me for 30 days
                </label>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full cursor-pointer rounded-xl bg-[#02a5d2] py-3 text-white",
                  "shadow-[0_4px_20px_rgba(0,183,232,0.4)] transition-all duration-300",
                  "hover:bg-[#0194bc] hover:shadow-[0_4px_25px_rgba(0,183,232,0.55)]",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-white/60">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-white underline decoration-[#00B7E8] decoration-2 underline-offset-4 hover:text-[#00B7E8]"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
