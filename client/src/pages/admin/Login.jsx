import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin_panel/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(res.message || "Logged in successfully");
        // navigate is handled by the useEffect watching isAuthenticated
      } else {
        toast.error(res.message || "Invalid credentials");
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-[#fafbfe] bg-cover bg-center">
      <div className="containers mx-auto px-4 mt-20">
        <div className="flex justify-center ">
          <div className="w-full max-w-105">
            <div className="bg-white rounded shadow-md overflow-hidden">
              {/* Logo Header */}
              <div className="bg-[#727cf5] py-4 text-center">
                <a href="/">
                  <span>
                    <img
                      src="/assets/images/logo.png"
                      alt="logo"
                      className="h-24 mx-auto"
                    />
                  </span>
                </a>
              </div>

              <div className="p-8 px-4">
                <div className="text-center w-3/4 mx-auto my-1">
                  <h4 className="text-[#6c757d] text-[18px] font-bold mb-1">
                    Sign In
                  </h4>
                  <p className="text-[#98a6ad] mb-6 text-[14px]">
                    Enter your username and password to access admin panel.
                  </p>
                </div>

                <form onSubmit={handleLogin}>
                  <div className="non-otp-div p-5">
                    <div className="mb-4">
                      <label
                        className="block text-[#6c757d] text-[14px]  mb-2"
                        htmlFor="tb_username"
                      >
                        Username
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#727cf5]"
                        type="text"
                        id="tb_username"
                        placeholder="Username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        className="block text-[#6c757d] text-[14px] mb-2"
                        htmlFor="tb_password"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="tb_password"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#727cf5] pr-12"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          required
                        />
                        <div
                          className="bg-gray-200 absolute inset-y-0 right-0 px-3 border border-l-0 border-gray-300 rounded-r flex items-center cursor-pointer text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-0 pt-2 text-center">
                      <button
                        className="bg-[#727cf5] hover:bg-[#6169d0] text-white font-medium py-2 px-4 rounded transition duration-300 disabled:opacity-50"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Authenticating..." : "Log In"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white w-full py-2 text-center">
        <div className="container mx-auto">
          <div className="text-gray-400 text-[15px]">
            {new Date().getFullYear()} © Fkart
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
