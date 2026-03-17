"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { NotebookPen, Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Tự động thông báo check email khi đăng ký (Supabase mặc định yêu cầu confirm email)
        alert("Thành công! Vui lòng kiểm tra email của bạn để xác nhận tài khoản.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/"; // Về trang chủ
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi với Google Login");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none opacity-80" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 transition-all duration-300 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-border">
            <NotebookPen className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Aura Notes</h1>
          <p className="text-muted text-sm mt-1">
            {isSignUp ? "Tạo tài khoản mới" : "Chào mừng bạn quay trở lại"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger-transparent border border-danger/20 text-danger text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 transition-shadow"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-foreground text-surface font-semibold rounded-xl hover:bg-foreground/90 transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignUp ? "Đăng ký" : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs font-medium text-muted uppercase">Hoặc</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <button
          onClick={signInWithGoogle}
          type="button"
          className="w-full mt-6 py-3 bg-surface border border-border text-foreground font-medium rounded-xl hover:bg-surface-hover transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Tiếp tục với Google
        </button>

        <div className="mt-8 text-center text-sm">
          <span className="text-muted">
            {isSignUp ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
          </span>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-accent hover:text-accent-hover font-semibold transition-colors"
          >
            {isSignUp ? "Đăng nhập" : "Đăng ký ngay"}
          </button>
        </div>
      </div>
    </main>
  );
}
