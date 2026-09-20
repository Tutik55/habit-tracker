import { useState } from "react";

type LoginProps = {
  onLogin: () => void;
  onGoToRegister: () => void;
};

export default function Login({
  onLogin,
  onGoToRegister,
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

onLogin();

      
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }




  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
      <div className="w-full max-w-md">

        {/* Logo / title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold">
            H
          </div>

          <h1 className="text-3xl font-semibold">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in and continue building your habits.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-[#171717] p-6 shadow-2xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                className="w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>

            <div>
  <label className="mb-2 block text-sm text-gray-400">
    Password
  </label>

  <div className="flex items-center rounded-xl border border-white/10 bg-[#101010] focus-within:border-blue-500">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      value={password}
      onChange={(event) => setPassword(event.target.value)}
      required
      className="w-full bg-transparent px-4 py-3 text-white outline-none placeholder:text-gray-600"
    />

    <button
      type="button"
      onClick={() => setShowPassword((current) => !current)}
      className="px-4 text-sm text-gray-400 hover:text-white"
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>
</div>

            {message && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?
            </p>

            <button
              type="button"
              onClick={onGoToRegister}
              className="mt-2 text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Create account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}