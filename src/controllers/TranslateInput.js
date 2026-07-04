// import express from "express";
// import axios from "axios";

// const router = express.Router();

// router.post("/", async (req, res) => {
//   const { text, source = "en", target = "hi" } = req.body;

// //   try {
// //     if (!text) {
// //       return res.json({ translatedText: "" });
// //     }

// //     const response = await axios.post(
// //       "https://google-translate1.p.rapidapi.com/language/translate/v2",
// //       new URLSearchParams({
// //         q: text,
// //         source: source,
// //         target: target,
// //         format: "text",
// //       }),
// //       {
// //         headers: {
// //           "Content-Type": "application/x-www-form-urlencoded",
// //           "X-RapidAPI-Key": process.env.RAPID_API_KEY,
// //           "X-RapidAPI-Host": "google-translate1.p.rapidapi.com",
// //         },
// //       },
// //     );

// //     const translatedText =
// //       response.data?.data?.translations?.[0]?.translatedText || "";

// //     res.json({ translatedText });
// //   } catch (err) {
// //     console.error("FULL ERROR:", err);
// //     console.error("ERROR RESPONSE:", err.response?.data);
// //     console.error("ERROR MESSAGE:", err.message);

// //     res.status(500).json({
// //       error: "Translation failed",
// //       details: err.response?.data || err.message,
// //     });
// //   }
// });

// export default router;




