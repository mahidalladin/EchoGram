const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL, // Your Vercel app
  'http://localhost:5173' // For local development
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("EchoGram backend is running!");
});

app.get("/auth/instagram", (req, res) => {
  const redirectUri = process.env.REDIRECT_URI;
  const clientId = process.env.INSTAGRAM_CLIENT_ID;

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=instagram_basic,instagram_manage_comments,pages_show_list&response_type=code`;

  res.redirect(authUrl);
});

app.get("/auth/instagram/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.get("https://graph.facebook.com/v19.0/oauth/access_token", {
      params: {
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        code,
      },
    });

    const access_token = tokenRes.data.access_token;
    res.redirect(`${process.env.FRONTEND_URL}/feed?token=${access_token}`);
  } catch (error) {
    console.error("Error getting access token:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to get access token" });
  }
});

app.get("/api/comments/:mediaId", async (req, res) => {
  const access_token = req.query.access_token;
  const mediaId = req.params.mediaId;

  if (!access_token || !mediaId) {
    return res.status(400).json({ error: "Missing media ID or access token" });
  }

  try {
    const pagesRes = await axios.get("https://graph.facebook.com/v19.0/me/accounts", {
      params: { access_token },
    });
    const page = pagesRes.data.data[0];
    if (!page) return res.status(404).json({ error: "No Facebook Pages found." });

    const igRes = await axios.get(`https://graph.facebook.com/v19.0/${page.id}`, {
      params: {
        fields: "instagram_business_account",
        access_token: page.access_token,
      },
    });

    const igUserId = igRes.data.instagram_business_account?.id;
    if (!igUserId) return res.status(404).json({ error: "No IG business account linked." });

    const commentsRes = await axios.get(`https://graph.facebook.com/v19.0/${mediaId}/comments`, {
      params: {
        access_token: page.access_token,
        fields: "id,text,timestamp,like_count,replies{id,text,timestamp}",
      },
    });

    res.json(commentsRes.data);
  } catch (err) {
    console.error("🔴 Error fetching comments:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.post("/api/comments/reply", async (req, res) => {
  const { access_token, commentId, message } = req.body;

  if (!access_token || !commentId || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const replyRes = await axios.post(`https://graph.facebook.com/v19.0/${commentId}/replies`, null, {
      params: { access_token, message },
    });

    res.json({ success: true, data: replyRes.data });
  } catch (err) {
    console.error("🔴 Error replying to comment:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to reply to comment" });
  }
});

app.get("/api/media", async (req, res) => {
  const access_token = req.query.access_token;
  if (!access_token) return res.status(400).json({ error: "Missing access token" });

  try {
    const pagesRes = await axios.get("https://graph.facebook.com/v19.0/me/accounts", {
      params: { access_token },
    });

    const page = pagesRes.data.data[0];
    if (!page) return res.status(404).json({ error: "No Facebook Pages found." });

    const igRes = await axios.get(`https://graph.facebook.com/v19.0/${page.id}`, {
      params: {
        fields: "instagram_business_account",
        access_token: page.access_token,
      },
    });

    const igUserId = igRes.data.instagram_business_account?.id;
    if (!igUserId) return res.status(404).json({ error: "Instagram account not linked to Page." });

    const mediaRes = await axios.get(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
      params: {
        fields: "id,caption,media_type,media_url,thumbnail_url,like_count,comments_count,timestamp",
        access_token,
      },
    });

    res.json(mediaRes.data);
  } catch (err) {
    console.error("🔴 Error fetching media:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch Instagram media" });
  }
});

app.get("/api/dashboard", async (req, res) => {
  const access_token = req.query.access_token;
  if (!access_token) return res.status(400).json({ error: "Missing access token" });

  try {
    const pagesRes = await axios.get("https://graph.facebook.com/v19.0/me/accounts", {
      params: { access_token },
    });

    const page = pagesRes.data.data[0];
    if (!page) return res.status(404).json({ error: "No Facebook Pages found." });

    const igRes = await axios.get(`https://graph.facebook.com/v19.0/${page.id}`, {
      params: {
        fields: "instagram_business_account",
        access_token: page.access_token,
      },
    });

    const igUserId = igRes.data.instagram_business_account?.id;
    if (!igUserId) return res.status(404).json({ error: "No IG business account linked." });

    const profileRes = await axios.get(`https://graph.facebook.com/v19.0/${igUserId}`, {
      params: {
        fields: "username,biography,profile_picture_url,followers_count,follows_count",
        access_token,
      },
    });

    const mediaRes = await axios.get(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
      params: {
        fields: "id,caption,media_type,media_url,thumbnail_url,like_count,comments_count,timestamp",
        access_token,
      },
    });

    const posts = mediaRes.data.data || [];

    const totalLikes = posts.reduce((acc, p) => acc + (p.like_count || 0), 0);
    const totalComments = posts.reduce((acc, p) => acc + (p.comments_count || 0), 0);
    const topPosts = posts
      .sort((a, b) => (b.like_count + b.comments_count) - (a.like_count + a.comments_count))
      .slice(0, 3);

    res.json({
      profile: {
        username: profileRes.data.username,
        bio: profileRes.data.biography,
        profile_picture: profileRes.data.profile_picture_url,
        followers_count: profileRes.data.followers_count,
        follows_count: profileRes.data.follows_count,
      },
      stats: {
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        engagementRate:
          profileRes.data.followers_count > 0
            ? ((totalLikes + totalComments) / profileRes.data.followers_count).toFixed(2)
            : "0.00",
        topPosts,
      },
    });
  } catch (err) {
    console.error("🔴 Error in /api/dashboard:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to load dashboard data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
