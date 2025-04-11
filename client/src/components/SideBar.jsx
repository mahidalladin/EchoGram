import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ThemeContext } from "../context/ThemeContext";
import Logo from "../assets/Logo.png";

function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { dark, setDark } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const accessToken = localStorage.getItem("ig_access_token");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`http://localhost:5000/api/dashboard?access_token=${accessToken}`);
        const data = await res.json();
        setUser(data.profile);
      } catch (err) {
        console.error("Error fetching sidebar user info:", err);
      }
    }

    if (accessToken) {
      fetchProfile();
    }
  }, [accessToken]);

  const handleLogout = () => {
    localStorage.removeItem("ig_access_token");
    toast.success("Logged out!");
    navigate("/");
  };

  const handleLinkClick = () => {
    if (isOpen && toggleSidebar) {
      toggleSidebar();
    }
  };

  return (
    <div className="h-full w-64 bg-white/90 dark:bg-gray-900 dark:text-white backdrop-blur-md shadow-xl z-50 transition-transform duration-300 border-r border-gray-200 dark:border-gray-700">
      <div className="text-center py-5 border-b border-gray-200 dark:border-gray-700 mb-4">
        <img src={Logo} alt="EchoGram Logo" className="w-40 h-auto mx-auto mb-2" />
      </div>

      <div className="flex items-center justify-between px-4 sm:hidden mb-4">
        <h2 className="font-semibold text-gray-700 dark:text-gray-200">Menu</h2>
        <button onClick={toggleSidebar} className="text-2xl text-gray-600 dark:text-gray-300">
          &times;
        </button>
      </div>

      <div className="flex items-center gap-3 px-4 mb-6">
        <img
          src={user?.profile_picture || "/default-avatar.png"}
          alt="User"
          className="w-12 h-12 rounded-full object-cover shadow"
        />
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            {user?.username || "..."}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Logged in</p>
        </div>
      </div>

      <nav className="space-y-2 px-2">
        <NavLink to="/dashboard" label="Dashboard" icon="📊" path={location.pathname} onClick={handleLinkClick} />
        <NavLink to="/feed" label="Feed" icon="🖼️" path={location.pathname} onClick={handleLinkClick} />
      </nav>

      <div className="absolute bottom-16 left-4 right-4">
        <button
          onClick={() => setDark(!dark)}
          className="w-full flex items-center justify-center gap-2 text-sm px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md shadow hover:shadow-md transition"
        >
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={handleLogout}
        className="absolute bottom-4 left-4 text-sm text-red-500 dark:text-red-400 hover:text-red-600 font-semibold"
      >
        🚪 Logout
      </motion.button>
    </div>
  );
}

function NavLink({ to, label, icon, path, onClick }) {
  const isActive = path === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium
        ${
          isActive
            ? "bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-700 dark:to-purple-800 text-indigo-700 dark:text-white shadow-sm"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        }
      `}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
    </Link>
  );
}

export default Sidebar;
