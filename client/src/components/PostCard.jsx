import { motion } from "framer-motion";

function PostCard({ post, onCommentClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white/90 dark:bg-gray-900 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
    >
      <div className="relative">
        <img
          src={post.image}
          alt="Post"
          className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4">
        <p className="text-gray-800 dark:text-gray-100 font-medium mb-2 line-clamp-2 text-sm md:text-base">
          {post.caption}
        </p>

        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
          <span>❤️ {post.likes}</span>
          <span>💬 {post.commentsCount}</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onCommentClick}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
        >
          View Comments
        </motion.button>
      </div>
    </motion.div>
  );
}

export default PostCard;
