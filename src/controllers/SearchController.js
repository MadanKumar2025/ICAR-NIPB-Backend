import Page from "../models/pageSchema.js";
// import OrganizationDetails from "../models/OrganizationDetailsSchema.js";
import News from "../models/NewsSchema.js";
import Scientist from "../models/ScientistSchema.js";

export const globalSearch = async (req, res) => {
  try {
    const keyword = req.query.keyword;

    if (!keyword) {
      return res.json([]);
    }

    const lowerKeyword = keyword.toLowerCase();

    const pages = await Page.find({});

    // Search news
    const news = await News.find({
      $or: [
        { "title.en": { $regex: keyword, $options: "i" } },
        { "title.hi": { $regex: keyword, $options: "i" } },
        { type: { $regex: keyword, $options: "i" } },
      ],
    });

    // Search news
    const scientists = await Scientist.find({
      $or: [
        { "scientistName.en": { $regex: keyword, $options: "i" } },
        { "scientistName.hi": { $regex: keyword, $options: "i" } },
      ],
    });

    const results = [];

    pages.forEach((p) => {
      if (
        p.pageTitle?.en?.toLowerCase().includes(lowerKeyword) ||
        p.pageTitle?.hi?.toLowerCase().includes(lowerKeyword) ||
        p.slug?.toLowerCase().includes(lowerKeyword)
      ) {
        results.push({
          title: p.pageTitle?.en || p.pageTitle?.hi,
          type: "page",
          url: `/${p.slug}`,
          apiName: p.apiName,
          designTemplate: p.designTemplate,
        });
      }
    });

    const newsPage = pages.find((p) => p.apiName === "news/get/web");
    news.forEach((n) => {
      results.push({
        title: n.title?.en || n.title?.hi,
        type: "news",
        url: newsPage ? `/${newsPage.slug}` : "/",
        apiName: "news/get/web",
      });
    });

    const scientistPage = pages.find(
      (p) => p.apiName === "ScientistRoutes/get/web",
    );
    const scientistUrl = scientistPage
      ? `/${scientistPage.slug}`
      : (() => {
          const fallback = pages.find(
            (p) => p.apiName === "ScientistRoutes/get/web",
          );
          return fallback ? `/${fallback.slug}` : "/scientist";
        })();

    scientists.forEach((s) => {
      results.push({
        title: s.scientistName?.en || s.scientistName?.hi,
        type: "scientist",
        url: scientistUrl,
        apiName: "ScientistRoutes/get/web",
      });
    });

    return res.json(results);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
