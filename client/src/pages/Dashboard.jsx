import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("ig_access_token");
    if (!accessToken) return;

    async function fetchDashboardData() {
      try {
        const res = await fetch(`http://localhost:5000/api/dashboard?access_token=${accessToken}`);
        const data = await res.json();

        const updatedTopPosts = (data.stats?.topPosts || []).map((post) => ({
          ...post,
          media_url:
            post.media_type === "VIDEO" || post.media_type === "REEL"
              ? post.thumbnail_url || post.media_url
              : post.media_url,
        }));

        setProfile(data.profile);
        setStats({ ...data.stats, topPosts: updatedTopPosts });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }

    fetchDashboardData();
  }, []);

  const pieData = [
    { name: "Likes", value: stats?.totalLikes || 0 },
    { name: "Comments", value: stats?.totalComments || 0 },
  ];

  const COLORS = ['#8b5cf6', '#22d3ee'];

  return (
    <>
    <Helmet>
    <title>EchoGram — Dashboard</title>
    <link rel="icon" href="/favicon.png" />
    </Helmet>
    <div className="space-y-10">
      <motion.h1
        className="text-3xl sm:text-4xl font-bold text-indigo-700 dark:text-indigo-300 mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📈 Your Instagram Dashboard
      </motion.h1>

      <motion.div
        className="flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <img
          src={profile?.profile_picture || "/default-avatar.png"}
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border-4 border-purple-200 dark:border-purple-600 shadow"
        />
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{profile?.username}</h2>
          <p className="text-gray-600 dark:text-gray-300">{profile?.bio}</p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            👥 {profile?.followers_count} followers • {profile?.follows_count} following
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Posts" value={stats?.totalPosts} />
        <StatCard label="Total Likes" value={stats?.totalLikes} />
        <StatCard label="Total Comments" value={stats?.totalComments} />
        <StatCard label="Engagement Rate" value={`${stats?.engagementRate}%`} />
      </div>

      <motion.div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold mb-4 text-indigo-700 dark:text-indigo-300 text-center">
          Engagement Breakdown
        </h3>
        <PieChart width={300} height={250}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </motion.div>

      <motion.div
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 mb-6">
          ⭐ Top Performing Posts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats?.topPosts?.map((post) => (
            <motion.div
              key={post.id}
              whileHover={{ scale: 1.02 }}
              className="border rounded-xl shadow-sm bg-white dark:bg-gray-900 p-3 transition hover:shadow-lg"
            >
              <img
                src={post.media_url}
                alt="top post"
                className="w-full h-40 object-cover rounded mb-2"
              />
              <p className="text-sm text-gray-800 dark:text-gray-100 font-medium mb-1 line-clamp-2">
                {post.caption}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ❤️ {post.like_count} | 💬 {post.comments_count}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 shadow-md p-4 rounded-xl text-center hover:shadow-lg transition"
      whileHover={{ scale: 1.03 }}
    >
      <h4 className="text-sm text-gray-500 dark:text-gray-300">{label}</h4>
      <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">
        {value ?? "--"}
      </p>
    </motion.div>
  );
}

export default Dashboard;
