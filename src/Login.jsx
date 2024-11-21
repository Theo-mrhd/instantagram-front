import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/users/login",
        {
          email,
          password,
        }
      );

      const { user, token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);

      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="my-5 text-3xl font-semibold text-center">Login</h1>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block w-full p-2.5"
          />
        </div>
        <div className="mt-4">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block w-full p-2.5"
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1C64FE] text-white text-center rounded py-2.5 mt-5"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
