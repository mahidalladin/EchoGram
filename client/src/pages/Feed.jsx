import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import PostCard from "../components/PostCard";
import CommentDrawer from "../components/CommentDrawer";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const processToken = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const hash = window.location.hash;

      // Handle Facebook's #_=_ hash
      if (hash === "#_=_") {
        window.history.replaceState(null, "", window.location.pathname);
      }

      if (token) {
        localStorage.setItem("ig_access_token", token);
        toast.success("Logged in successfully!");
        window.history.replaceState(null, "", "/feed");
        return token;
      }
      
      return localStorage.getItem("ig_access_token");
    };

    const token = processToken();
    
    if (!token) {
      setError("No access token found. Redirecting to login...");
      toast.error("Please log in first");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    const fetchMedia = async () => {
      const accessToken = localStorage.getItem("ig_access_token");
      if (!accessToken) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/media?access_token=${accessToken}`
        );
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (data.error) {
          throw new Error(data.error.message || "Failed to fetch media");
        }

        const formatted = data.data.map((post) => ({
          ...post,
          image:
            post.media_type === "VIDEO" || post.media_type === "REEL"
              ? post.thumbnail_url || post.media_url
              : post.media_url,
        }));
        
        setPosts(formatted);
      } catch (err) {
        console.error("Error fetching media:", err);
        setError(err.message || "Something went wrong while fetching your posts.");
        
        // If token is invalid, clear it and redirect
        if (err.message.includes("invalid token")) {
          localStorage.removeItem("ig_access_token");
          setTimeout(() => navigate("/"), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl shadow-lg max-w-md mx-4 text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          {error.includes("Redirecting") && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Taking you back to login page...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>EchoGram — Feed</title>
        <link rel="icon" href="/feed-favicon.png" />
      </Helmet>
      <div className="px-2 sm:px-4">
        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold text-center mb-10 text-gray-800 dark:text-white"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.span
            className="text-indigo-600 dark:text-indigo-400"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Welcome to&nbsp;
          </motion.span>
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 animate-text-shimmer"
          >
            EchoGram
          </motion.span>
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow p-4 space-y-4"
                >
                  <div className="bg-gray-300 dark:bg-gray-600 h-40 w-full rounded-md"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  <div className="h-8 bg-purple-200 dark:bg-purple-700 rounded w-full"></div>
                </div>
              ))
            : posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PostCard
                    post={{
                      id: post.id,
                      image: post.image,
                      caption: post.caption || "No caption",
                      likes: post.like_count,
                      commentsCount: post.comments_count,
                      timestamp: post.timestamp,
                    }}
                    onCommentClick={() => setSelectedPost(post)}
                  />
                </motion.div>
              ))}
        </div>

        {selectedPost && (
          <CommentDrawer post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}
      </div>
    </>
  );
}

export default Feed;