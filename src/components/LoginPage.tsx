import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Signal, ArrowLeft, Shield, Sparkles, UserPlus, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner@2.0.3";
import { signIn, signUp } from "@/lib/authService";
import { getUserProfile, upsertUserProfile } from "@/lib/userService";

// ✅ Google Auth (production-safe redirect flow)
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  signInWithRedirect,
} from "firebase/auth";

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (userData: { name: string; email: string; location: string; isAdmin?: boolean }) => void;
  isAdminLogin: boolean;
}

export function LoginPage({ onNavigate, onLogin, isAdminLogin }: LoginPageProps) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLocation, setSignupLocation] = useState("");

  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();

  // ✅ Handle Google redirect result (runs after returning from Google)
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (!result?.user) return;

        const fbUser = result.user;

        // Load profile; create one if missing
        const existing = await getUserProfile(fbUser.uid);

        const profile = existing ?? {
          uid: fbUser.uid,
          name:
            fbUser.displayName ||
            (fbUser.email ? fbUser.email.split("@")[0] : "User"),
          email: fbUser.email ?? "",
          location: existing?.location ?? "Newark, NJ",
          isAdmin: !!existing?.isAdmin,
        };

        if (!existing) {
          await upsertUserProfile(profile);
        }

        // If this is admin-only login page, block non-admins
        if (isAdminLogin && !profile.isAdmin) {
          toast.error("This account is not an admin.");
          return;
        }

        onLogin({
          name: profile.name,
          email: profile.email,
          location: profile.location,
          isAdmin: !!profile.isAdmin,
        });

        toast.success(isAdminLogin ? "Welcome, Admin!" : "Logged in with Google!");
        onNavigate(isAdminLogin ? "admin" : "dashboard");
      })
      .catch((err: any) => {
        console.error("Google redirect result error:", err);
        toast.error(err?.message ?? "Google login failed");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      console.error("Google login start error:", err);
      toast.error(err?.message ?? "Google login failed");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    (async () => {
      try {
        const cred = await signIn(loginEmail, loginPassword);
        const fbUser = cred.user;

        const profile = await getUserProfile(fbUser.uid);
        const isAdmin = !!profile?.isAdmin;

        if (isAdminLogin && !isAdmin) {
          toast.error("This account is not an admin.");
          return;
        }

        onLogin({
          name: profile?.name ?? (fbUser.email ? fbUser.email.split("@")[0] : "User"),
          email: fbUser.email ?? loginEmail,
          location: profile?.location ?? "",
          isAdmin,
        });

        toast.success(isAdminLogin ? "Welcome, Admin!" : "Login successful!");
        onNavigate(isAdminLogin ? "admin" : "dashboard");
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message ?? "Login failed");
      }
    })();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    (async () => {
      try {
        const cred = await signUp(signupEmail, signupPassword);
        const fbUser = cred.user;

        const profile = {
          uid: fbUser.uid,
          name: signupName || (fbUser.email ? fbUser.email.split("@")[0] : "User"),
          email: fbUser.email ?? signupEmail,
          location: signupLocation || "Newark, NJ",
          isAdmin: false,
        };

        await upsertUserProfile(profile);

        onLogin({
          name: profile.name,
          email: profile.email,
          location: profile.location,
          isAdmin: false,
        });

        toast.success("Account created successfully!");
        onNavigate("dashboard");
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message ?? "Signup failed");
      }
    })();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -80, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-400/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <motion.header
        className="container mx-auto px-4 py-6 relative z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button onClick={() => onNavigate("home")} variant="ghost" className="gap-2 hover:bg-white/50">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </motion.header>

      <main className="container mx-auto px-4 py-6 md:py-8 max-w-md relative z-10">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            {isAdminLogin ? (
              <motion.div
                className="relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            ) : (
              <motion.div
                className="relative"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Signal className="w-8 h-8 text-white" />
                </div>
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            )}
            <div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NetPulse
              </span>
              <p className="text-xs text-gray-600">Network Intelligence</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-3 text-gray-800">
            {isAdminLogin ? "Admin Access" : "Welcome Back"}
          </h1>

          <p className="text-gray-700 text-lg">
            {isAdminLogin
              ? "Access the admin dashboard to view analytics"
              : "Sign in to report network issues and earn rewards"}
          </p>

          {isAdminLogin && (
            <motion.div
              className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl text-sm text-gray-700 border-2 border-blue-200 shadow-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 justify-center mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <p className="font-bold">Demo Credentials</p>
              </div>
              <p className="font-mono bg-white/60 px-3 py-1 rounded mb-1">admin@netpulse.com</p>
              <p className="font-mono bg-white/60 px-3 py-1 rounded">admin123</p>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="login" className="w-full">
            {!isAdminLogin && (
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-white/80 backdrop-blur-sm border-2">
                <TabsTrigger
                  value="login"
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="login">
              <Card className="p-6 md:p-8 bg-white/90 backdrop-blur-sm border-2 shadow-2xl">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <Label htmlFor="login-email" className="text-base font-semibold">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="mt-2 border-2 focus:border-blue-400 h-12"
                    />
                  </div>

                  <div>
                    <Label htmlFor="login-password" className="text-base font-semibold">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="mt-2 border-2 focus:border-blue-400 h-12"
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl text-lg py-6 rounded-xl gap-2"
                    >
                      {isAdminLogin ? (
                        <>
                          <Shield className="w-5 h-5" />
                          Login as Admin
                        </>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5" />
                          Login
                        </>
                      )}
                    </Button>
                  </motion.div>

                  {!isAdminLogin && (
                    <>
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t-2" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-white px-3 text-gray-500 font-medium">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-2 h-12 hover:bg-gray-50"
                          onClick={handleGoogleLogin}
                        >
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Login with Google
                        </Button>
                      </motion.div>
                    </>
                  )}
                </form>
              </Card>
            </TabsContent>

            {!isAdminLogin && (
              <TabsContent value="signup">
                <Card className="p-6 md:p-8 bg-white/90 backdrop-blur-sm border-2 shadow-2xl">
                  <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                      <Label htmlFor="signup-name" className="text-base font-semibold">
                        Name
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                        className="mt-2 border-2 focus:border-blue-400 h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-email" className="text-base font-semibold">
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        className="mt-2 border-2 focus:border-blue-400 h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-password" className="text-base font-semibold">
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        className="mt-2 border-2 focus:border-blue-400 h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="signup-location" className="text-base font-semibold">
                        Location (Optional)
                      </Label>
                      <Input
                        id="signup-location"
                        type="text"
                        placeholder="Newark, NJ"
                        value={signupLocation}
                        onChange={(e) => setSignupLocation(e.target.value)}
                        className="mt-2 border-2 focus:border-blue-400 h-12"
                      />
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl text-lg py-6 rounded-xl gap-2"
                      >
                        <UserPlus className="w-5 h-5" />
                        Create Account
                      </Button>
                    </motion.div>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t-2" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-3 text-gray-500 font-medium">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-2 h-12 hover:bg-gray-50"
                        onClick={handleGoogleLogin}
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Sign up with Google
                      </Button>
                    </motion.div>
                  </form>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
