import { useState } from "react";
import { API_URL } from "./config";


type RegisterProps = {
  onGoToLogin: () => void;
};

export default function Register({ onGoToLogin }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch(
  `${API_URL}/api/auth/register`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      setSuccess(true);
      setMessage("Account created successfully.");

      setTimeout(() => {
        onGoToLogin();
      }, 1000);
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

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold">
            H
          </div>

          <h1 className="text-3xl font-semibold">
            Create account
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Start building better habits today.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#171717] p-6 shadow-2xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Name
              </label>

              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
                className="w-full rounded-xl border border-white/10 bg-[#101010] px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
              />
            </div>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  className="w-full bg-transparent px-4 py-3 text-white outline-none placeholder:text-gray-600"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  className="px-4 text-sm text-gray-400 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {message && (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  success
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-red-500/20 bg-red-500/10 text-red-400"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?
            </p>

            <button
              type="button"
              onClick={onGoToLogin}
              className="mt-2 text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}