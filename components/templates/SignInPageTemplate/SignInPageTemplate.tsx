"use client";

import { ThemeToggle } from "@/components/atoms";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { AuthService } from "@/services";
import { setUser } from "@/store/slices";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      email,
      password,
      rememberMe,
    };

    const response = await authService.login(payload);

    if (!response?.data?.accessToken) {
      toast.error("Login failed: No token received");
      return;
    }

    const { accessToken } = response.data;

    localStorage.setItem("accessToken", accessToken);

    const profileData = await authService.getProfile(accessToken);

    // ✅ Correct (passes only the user object)
    dispatch(setUser({ user: profileData.data, accessToken }));

    router.push("/");

    console.log("Profile Data: ", profileData);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Image Section */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden">
        <img
          alt="Luxury modern real estate architecture"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHjHBbR2nhjvm8eFzAFPOVbhU9Rzhynmo85AEP4j7a9lesXFKtMV__WlATnikQ1LuqohziS1vO4qRZUAVQphv7BffKHB6p0J9lHLtG-yowD_lmrNEyrNWvf7sHJuHCGuPoRvffU_uCdetOOzxc76ZqUhweJoWfyYmyJXgECKdjD4bI_P-G6RDVVYvR4PrESqw_j2kyxOyhhoRb_8__0cCpNv5K5lp59ySAwWJy2R56fMnsW5G1rgp56GCw8euvrcMM7y3nzAaETYo"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-primary h-1 w-12 rounded-full"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Fatima Marketing Premium
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
            Elevating Real Estate <br /> Through Strategic Marketing.
          </h1>
          <p className="text-lg text-gray-300 max-w-lg">
            Access our enterprise-grade property management suite and marketing
            tools designed for the modern agent.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 lg:px-16 lg:py-12 bg-background-light dark:bg-charcoal">
        <div className="w-full max-w-md">
          <div className="mb-5 text-center md:text-left">
            <img
              alt="Fatima Marketing Logo"
              className="h-40 w-auto mb-8 mx-auto md:mx-0 object-contain"
              src={"/FatimaMarketingLogo.png"}
            />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  className="p-3"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
                  >
                    Password
                  </label>
                  {/* <a
                    href="#"
                    className="text-xs font-semibold text-primary hover:underline underline-offset-4"
                  >
                    Forgot Password?
                  </a> */}
                </div>
                <PasswordInput
                  id="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  className="p-3"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember Me — using custom Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                className="w-4.5 h-4.5"
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label
                htmlFor="remember-me"
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Sign In Button */}
            <Button type="submit" className="w-full text-white cursor-pointer">
              Sign In
            </Button>

            {/* Divider */}
            {/* <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-medium uppercase">
                Or continue with
              </span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
            </div> */}

            {/* Social Buttons */}
            {/* <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="gap-2">
                <img
                  alt="Google"
                  className="w-5 h-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9iVZcfwyAJZFy7zkuF0z1tBEWBwxOuOSMehVJJ542RfMpeFJnzLX2QuntC2BTT8pEVB4lyG8CuJhpFC5IUbABTDD3L1BnWqtIA6CkGf2A5-8cVuj1Zn_fi0BkM0VvF3F_Mqixr9Uki56S1pGG-oSTGt3AhyPsKVUi0kKlFVkXIFOl2MOkIzoq4lwNu_SSQLB8ZDL6f54-RhFOL0Qz9FG0iWl1qoNJdDrqnRa0WkB3jvJlabY2zwRjJGrWwCgAxfrcVJRbc3ZvhIA"
                />
                Google
              </Button>
              <Button variant="outline" className="gap-2">
                <img
                  alt="Github"
                  className="w-5 h-5 dark:invert"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEFY4hcgf74B85_788-rxM2g7gizMHZ116j8XcyP_ezzIPtQYulE24u7-Oi8xly_Ab5f8LILEvuvGEEIrovqG4OET1a6RJ8fKoDeUiJbQZ4NXeVFBlHWDCAKl_EBzQkc-75Nwg8sHRF_ZjPXPj7-Hnt8ot3M4JArG_3gxcueOkrdUHRIHlu7ciaSHxD6w6gFwB8m3PfeG90wfKoZgtYbId-1PT6W7q-FwKlxZYC8oJ03bgiWCBrLv9UuL-QxEVuZHI5NTkg9Eg230"
                />
                Github
              </Button>
            </div> */}
          </form>

          <p className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary underline-offset-4 decoration-primary decoration-2 underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="fixed bottom-6 right-6 flex gap-2">
        <ThemeToggle />
      </div>
    </div>
  );
}
