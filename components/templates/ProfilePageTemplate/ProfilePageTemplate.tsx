"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services";
import { RootState } from "@/store";
import { updateUser } from "@/store/slices";
import { User } from "@/types";
import { compressImage } from "@/utils";
import { format } from "date-fns";
import { ChangeEvent, useRef, useState } from "react";
import {
  FiCalendar,
  FiCamera,
  FiKey,
  FiMail,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";

const ProfilePageTemplate = () => {
  const user = useSelector(
    (state: RootState) => state.auth.user,
  ) as User | null;

  const dispatch = useDispatch();

  // For future: handle file selection
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null); // Base64 or URL

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  const getRoleLabel = (roleType: string) => {
    switch (roleType) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "sales_officer":
        return "Sales Officer";
      default:
        return "User";
    }
  };

  const getRoleBadgeColor = (roleType: string) => {
    switch (roleType) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "sales_officer":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusBadge = () => {
    if (!("status" in user)) return null;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
          user.status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-slate-200 text-slate-600",
        )}
      >
        {user.status === "active" ? "Active" : "Inactive"}
      </span>
    );
  };

  // Handle image selection (you can later integrate compression/upload here)
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. Compress image (using the utility we built earlier)
      const compressedBlob = await compressImage(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.7,
        outputType: "image/jpeg",
      });

      // 2. Convert to Base64
      const base64String = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(compressedBlob);
      });

      // 3. Strip the "data:image/jpeg;base64," prefix
      const profileImage = base64String.split(",")[1];

      // 4. Upload via AuthService
      const authService = new AuthService();
      const result = await authService.updateProfileImage({ profileImage });

      // 5. Update local state/UI
      setProfileImage(base64String); // keep full data URL for display
      dispatch(updateUser(result.data)); // if using Redux

      console.log("Profile updated!", result);
    } catch (error: any) {
      alert(error.message || "Failed to upload image");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Determine image source: uploaded, Base64 from DB, or fallback
  const imageSrc =
    profileImage ||
    (user.profileImage ? `data:image/jpeg;base64,${user.profileImage}` : null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        className="hidden"
        id="profile-image-upload"
      />

      <main className="max-w-[90%] lg:max-w-[90%] mx-auto px-1 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-[#00B7E8] font-bold text-xs uppercase tracking-widest mb-2 bg-slate-100 border border-slate-100 px-3 py-1 rounded-full w-max">
            <HiOutlineDocumentText className="text-base" />
            Profile
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-[#142C4B]">
            My Profile
          </h1>
          <p className="text-slate-500 max-w-xl">
            View and manage your account details.
          </p>
        </div>

        {/* Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Card */}
          <div className="lg:col-span-2">
            <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-200 p-6">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FiUser className="text-[#00B7E8]" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {/* Profile Image Section */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                        <FiUser className="text-2xl" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                      aria-label="Change profile picture"
                    >
                      <FiCamera className="text-white text-lg" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Profile Picture
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {imageSrc ? "Click to change" : "No image uploaded"}
                    </p>
                  </div>
                </div>

                <ProfileRow
                  label="Full Name"
                  value={user.full_name}
                  icon={<FiUser />}
                />
                <ProfileRow
                  label="Email Address"
                  value={user.email}
                  icon={<FiMail />}
                />
                <ProfileRow
                  label="Role"
                  value={getRoleLabel(user.role.role_type)}
                  icon={<FiShield />}
                  badge={
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold",
                        getRoleBadgeColor(user.role.role_type),
                      )}
                    >
                      {getRoleLabel(user.role.role_type)}
                    </span>
                  }
                />
                {user.status !== undefined && (
                  <ProfileRow
                    label="Status"
                    value=""
                    icon={<FiCalendar />}
                    badge={getStatusBadge()}
                  />
                )}
                {user.showPassword && (
                  <ProfileRow
                    label="Password"
                    value="••••••••"
                    icon={<FiKey />}
                    tooltip={`Your password: ${user.showPassword}`}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Meta Info Sidebar */}
          <div>
            <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-200 p-6">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <MetaItem
                  label="Member Since"
                  value={format(new Date(user.created_at), "dd MMM yyyy")}
                  icon={<FiCalendar className="text-slate-500" />}
                />
                <MetaItem
                  label="Last Updated"
                  value={format(new Date(user.updated_at), "dd MMM yyyy")}
                  icon={<FiCalendar className="text-slate-500" />}
                />
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Your account ID:{" "}
                    <code className="font-mono text-slate-700">{user._id}</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable Row Component
const ProfileRow = ({
  label,
  value,
  icon,
  badge,
  tooltip,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  tooltip?: string;
}) => (
  <div className="flex items-start gap-4">
    <div className="mt-0.5 text-slate-500">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      {badge ? (
        <div className="mt-1">{badge}</div>
      ) : (
        <p
          className="font-medium text-slate-900 break-words"
          title={tooltip || value}
        >
          {value}
        </p>
      )}
    </div>
  </div>
);

// Reusable Meta Item
const MetaItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center gap-3">
    {icon}
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  </div>
);

export default ProfilePageTemplate;
