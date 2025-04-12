import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import PostCard from "../components/PostCard";
import CommentDrawer from "../components/CommentDrawer";
import { Helmet } from "react-helmet";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("ig_access_token", token);
      toast.success("Logged in successfully!");
      window.history.replaceState(null, "", "/feed");
    }
  }, []);

  const accessToken = localStorage.getItem("ig_access_token");

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/media?access_token=${accessToken}`);
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          const formatted = data.data.map((post) => ({
            ...post,
            image:
              post.media_type === "VIDEO" || post.media_type === "REEL"
                ? post.thumbnail_url || post.media_url
                : post.media_url,
          }));
          setPosts(formatted);
        }
      } catch (err) {
        console.error("Error fetching media:", err);
        setError("Something went wrong while fetching your posts.");
        toast.error("Failed to load posts. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchMedia();
    } else {
      setError("Instagram access token missing. Please log in again.");
      setLoading(false);
    }
  }, [accessToken]);

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

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6 shadow-md text-center">
          {error}
        </div>
      )}

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
