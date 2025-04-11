import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

function CommentDrawer({ post, onClose }) {
  const [comments, setComments] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [loading, setLoading] = useState(true);

  const accessToken = localStorage.getItem("ig_access_token");

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid date";

    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    const min = Math.floor(diff / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    return `${d}d ago`;
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${post.id}/comments?fields=id,text,timestamp,like_count,replies{id,text,timestamp}&access_token=${accessToken}`
      );
      const data = await res.json();
      const sorted = (data.data || []).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setComments(sorted);
    } catch (err) {
      toast.error("Failed to fetch comments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    setVisibleCount(10);
  }, [post.id]);

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return toast.error("Reply cannot be empty");

    setReplying(true);
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${commentId}/replies?access_token=${accessToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: replyText }),
        }
      );

      const result = await res.json();

      if (result.id) {
        toast.success("Reply sent!");
        const newReply = {
          id: result.id,
          text: replyText,
          created_time: new Date().toISOString(),
        };

        const updatedComments = comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                replies: {
                  data: [...(comment.replies?.data || []), newReply],
                },
              }
            : comment
        );

        setComments(updatedComments);
        setReplyText("");
        setActiveReplyId(null);
      } else {
        toast.error("Failed to send reply.");
      }
    } catch (err) {
      toast.error("Something went wrong while sending the reply.");
      console.error(err);
    } finally {
      setReplying(false);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed top-0 right-0 w-full sm:w-[400px] h-full bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700 p-6 z-50 overflow-y-auto text-gray-900 dark:text-gray-100"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Comments</h2>
        <button
          onClick={onClose}
          className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-2xl transition"
        >
          &times;
        </button>
      </div>

      <img
        src={post.thumbnail_url || post.media_url || post.image}
        alt="Post"
        className="rounded-lg mb-4 w-full h-48 object-cover"
      />

      <p className="text-gray-700 dark:text-gray-300 mb-4">{post.caption}</p>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6" />
              <div className="h-3 bg-gray-200 dark:bg-gray-500 rounded w-1/2" />
              <div className="h-6 bg-purple-100 dark:bg-purple-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 italic">No comments yet.</p>
      ) : (
        <div className="space-y-6">
          {comments.slice(0, visibleCount).map((comment) => {
            const created = comment?.timestamp || comment?.created_time || null;

            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="border-b border-gray-200 dark:border-gray-700 pb-3"
              >
                <div className="flex justify-between items-center">
                  <p className="text-gray-800 dark:text-gray-100">{comment.text}</p>
                  <span className="text-xs text-gray-400 ml-2">
                    {formatTime(created)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span>{comment.like_count || 0} ❤️</span>
                  <button
                    onClick={() =>
                      setActiveReplyId(activeReplyId === comment.id ? null : comment.id)
                    }
                    className="text-blue-500 font-medium hover:underline"
                  >
                    {activeReplyId === comment.id ? "Cancel" : "Reply"}
                  </button>
                </div>

                {/* Replies */}
                <div className="mt-2 space-y-2">
                  {comment.replies?.data?.map((reply) => {
                    const replyTime = reply?.timestamp || reply?.created_time || null;

                    return (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm"
                      >
                        <p>{reply.text}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatTime(replyTime)}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Reply Box */}
                {activeReplyId === comment.id && (
                  <div className="mt-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:placeholder-gray-500"
                      placeholder="Write your reply..."
                    />
                    <button
                      onClick={() => handleReply(comment.id)}
                      disabled={replying}
                      className="mt-2 bg-purple-600 text-white px-4 py-1.5 rounded hover:bg-purple-700 transition text-sm font-medium"
                    >
                      {replying ? "Replying..." : "Reply"}
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}

          {visibleCount < comments.length && (
            <div className="text-center mt-4">
              <button
                onClick={() => setVisibleCount(visibleCount + 10)}
                className="text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
              >
                Load more comments
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default CommentDrawer;
