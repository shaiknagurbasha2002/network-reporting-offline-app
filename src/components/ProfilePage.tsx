import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ArrowLeft, Upload } from "lucide-react";
import {
  updateUserProfile,
  subscribeUserProfile,
  uploadProfilePic,
  type UserProfile,
} from "@/lib/profileService";
import { useAuthUser } from "@/lib/useAuthUser";

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user: authUser } = useAuthUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!authUser?.uid) {
      setProfile(null);
      setBio("");
      setIsDirty(false);
      return;
    }

    const unsub = subscribeUserProfile(authUser.uid, (p) => {
      setProfile(p);
      if (!isDirtyRef.current) {
        setDisplayName(p?.displayName ?? authUser.displayName ?? "");
        setBio(p?.bio ?? "");
      }
    });

    return () => unsub();
  }, [authUser?.uid]);

  const initials = useMemo(() => {
    const name = profile?.displayName || authUser?.displayName || authUser?.email || "User";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  }, [profile?.displayName, authUser?.displayName, authUser?.email]);

  const handleBioChange = (value: string) => {
    setBio(value.slice(0, 160));
    setIsDirty(true);
    isDirtyRef.current = true;
  };

  const handleNameChange = (value: string) => {
    setDisplayName(value);
    setIsDirty(true);
    isDirtyRef.current = true;
  };

  const handleSave = async () => {
    if (!authUser?.uid) return;
    try {
      setSaving(true);
      await updateUserProfile({
        uid: authUser.uid,
        displayName: displayName.trim() || authUser.displayName || authUser.email || "User",
        bio,
        email: authUser.email ?? "",
      });
      setIsDirty(false);
      isDirtyRef.current = false;
      toast.success("Profile updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!authUser?.uid) return;
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      await uploadProfilePic(authUser.uid, file, setUploadProgress);
      toast.success("Profile photo updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to upload photo");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-10 max-w-xl">
          <Card className="p-6 bg-white/90 border-2 shadow-xl text-center">
            <p className="text-gray-700 mb-4">Please login to view your profile.</p>
            <Button onClick={() => onNavigate("login")}>Go to Login</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <motion.header
        className="container mx-auto px-4 py-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Button onClick={() => onNavigate("dashboard")} variant="ghost" className="gap-2 hover:bg-white/60">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </motion.header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your profile picture and bio.</p>
        </motion.div>

        <Card className="p-6 md:p-8 bg-white/90 border-2 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-28 h-28 border-4 border-blue-200 shadow-lg">
                <AvatarImage src={profile?.photoURL ?? authUser.photoURL ?? ""} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-3xl">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <Button onClick={handleUploadClick} disabled={uploading} className="gap-2">
                <Upload className="w-4 h-4" />
                {uploading ? `Uploading... ${uploadProgress}%` : "Upload Photo"}
              </Button>
              <p className="text-xs text-gray-500">JPG, PNG, WEBP • Max 10MB</p>
            </div>

            <div className="flex-1 w-full">
              <div className="space-y-5">
                <div>
                  <Label className="text-base font-semibold">Email</Label>
                  <Input value={profile?.email ?? authUser.email ?? ""} readOnly className="mt-2" />
                </div>

                <div>
                  <Label className="text-base font-semibold">Name</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="mt-2"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold">Bio</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => handleBioChange(e.target.value)}
                    maxLength={160}
                    className="mt-2 min-h-28"
                    placeholder="Tell the community a bit about you..."
                  />
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    {bio.length}/160
                  </div>
                </div>

                <div className="pt-2">
                  <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
