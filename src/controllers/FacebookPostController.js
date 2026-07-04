// import axios from "axios";

// export const getFacebookPosts = async (req, res) => {
//   try {
//     const response = await axios.get(
//       `https://graph.facebook.com/v23.0/${process.env.FACEBOOK_PAGE_ID}/posts`,
//       {
//         params: {
//           fields: "id,message,created_time,full_picture,permalink_url",
//           access_token: process.env.FACEBOOK_PAGE_TOKEN,
//         },
//       }
//     );

//     res.status(200).json({
//       success: true,
//       data: response.data.data,
//       paging: response.data.paging || null,
//     });

//   } catch (error) {
//     console.error("Facebook API Error:", error.response?.data || error.message);

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch Facebook posts",
//     });
//   }
// };

import axios from "axios";

export const getFacebookPosts = async (req, res) => {
  try {
    const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
    const TOKEN = process.env.FACEBOOK_PAGE_TOKEN;

    //  Posts fetch
    const postsPromise = axios.get(
      `https://graph.facebook.com/v23.0/${PAGE_ID}/posts`,
      {
        params: {
          fields: "id,message,created_time,full_picture,permalink_url",
          access_token: TOKEN,
        },
      },
    );

    //  Videos / Reels fetch
    const reelsPromise = axios.get(
      `https://graph.facebook.com/v23.0/${PAGE_ID}/videos`,
      {
        params: {
          fields: "id,description,created_time,picture,permalink_url",
          access_token: TOKEN,
        },
      },
    );

    // Run both together
    const [postsRes, reelsRes] = await Promise.all([
      postsPromise,
      reelsPromise,
    ]);

    const posts = postsRes.data.data.map((p) => ({
      type: "post",
      id: p.id,
      title: p.message || "Untitled Post",
      image: p.full_picture || null,
      url: p.permalink_url,
      created_time: p.created_time,
    }));

    const reels = reelsRes.data.data.map((r) => ({
      type: "reel",
      id: r.id,
      title: r.description || "Untitled Reel",
      image: r.picture || null,
      url: r.permalink_url,
      created_time: r.created_time,
    }));

    // Merge feed
    const feed = [...posts, ...reels].sort(
      (a, b) => new Date(b.created_time) - new Date(a.created_time),
    );

    res.status(200).json({
      success: true,
      data: feed,
    });
  } catch (error) {
    console.error("Facebook API Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch Facebook feed",
    });
  }
};
