import { motion } from "framer-motion";
import { FaInstagram, FaChartLine, FaCommentDots } from "react-icons/fa";
import logo from "../assets/Logo.png";
import { Helmet } from "react-helmet";


function Landing() {
  return (
    <>
    <Helmet>
  <title>EchoGram — Home</title>
  <link rel="icon" href="/feed-favicon.png" />
</Helmet>

    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 text-white px-6 py-10 font-inter">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl mx-auto mb-16"
      >
        <img src={logo} alt="EchoGram Logo" className="w-64 h-28 mx-auto mb-4" />
        <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
          Welcome to EchoGram
        </h1>
        <p className="text-lg text-white/80 mt-3">
          Your personalized Instagram dashboard — track performance, engage with comments, and more.
        </p>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href={`${import.meta.env.VITE_API_URL}/auth/instagram`}
          className="inline-block mt-6 bg-white text-purple-700 px-6 py-3 rounded-xl shadow-md font-semibold hover:bg-gray-100 transition text-lg"
        >
          🚀 Login with Instagram
        </motion.a>
      </motion.div>

      {/* Features */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2 } },
        }}
        className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20"
      >
        <FeatureCard
          icon={<FaInstagram size={28} />}
          title="Instagram Login"
          desc="Securely connect your business or creator account to access insights."
        />
        <FeatureCard
          icon={<FaChartLine size={28} />}
          title="Track Performance"
          desc="See top-performing posts, engagement stats, and growth trends."
        />
        <FeatureCard
          icon={<FaCommentDots size={28} />}
          title="Reply to Comments"
          desc="Engage with your audience in real time with the comment reply tool."
        />
      </motion.div>

      {/* Footer */}
      <div className="text-center text-sm text-white/60 mt-12">
        Built with ❤️ by Alladin • EchoGram © {new Date().getFullYear()}
      </div>
    </div>
    </>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white/10 backdrop-blur p-6 rounded-xl shadow-md text-white"
    >
      <div className="mb-3 text-indigo-100">{icon}</div>
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      <p className="text-sm text-white/80">{desc}</p>
    </motion.div>
  );
}

export default Landing;
