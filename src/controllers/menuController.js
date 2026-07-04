import Menu from "../models/MenuSchema.js";

export const createMenu = async (req, res) => {
  try {
    const {
      menuType,
      menuCategory,
      parentMenuId,
      menuName_en,
      menuName_hi,
      pageId,
      customUrl,
      order,
    } = req.body;

    if (!menuCategory) {
      return res.status(400).json({
        success: false,
        message: "Menu Category required hai",
      });
    }

    if (!menuType) {
      return res.status(400).json({
        success: false,
        message: "menuType aur required",
      });
    }
    if (!menuName_en || !menuName_hi) {
      return res.status(400).json({
        success: false,
        message: "menuName required hai (English & Hindi dono)",
      });
    }

    // if ((pageId && customUrl) || (!pageId && !customUrl)) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "Only one of pageId or customUrl should be provided (not both).",
    //   });
    // }

    // URL validation
    const urlPattern =
      /^(https?:\/\/)(([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})(\/.*)?$/;

    if (customUrl && !urlPattern.test(customUrl)) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format",
      });
    }

    // --- Check existing ---
    const existingMenuEn = await Menu.findOne({
      "menuName.en": menuName_en,
    });

    const existingMenuHi = await Menu.findOne({
      "menuName.hi": menuName_hi,
    });

    if (existingMenuEn || existingMenuHi) {
      return res.status(400).json({
        success: false,
        message: "Menu name already exists in English or Hindi",
      });
    }

    // --- Create menu ---
    const menu = await Menu.create({
      menuType,
      parentMenuId: parentMenuId || null,
      menuCategory: menuCategory || null,
      // important fix here
      menuName: {
        en: menuName_en,
        hi: menuName_hi,
      },

      pageId: pageId || null,
      customUrl: customUrl || null,
      order: order || 0,
      createby: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "The menu has been created successfully.",
      data: menu,
    });
  } catch (error) {
    console.error("Error creating menu:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getMenus = async (req, res) => {
  try {
    const menus = await Menu.find()
      .populate("parentMenuId", "menuName")
      .populate("pageId", "title")
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ order: 1 });

    const data = menus.map((menu) => ({
      id: menu._id,
      menuType: menu.menuType,
      menuCategory: menu.menuCategory,

      menuName_en: menu.menuName?.en || "",
      menuName_hi: menu.menuName?.hi || "",

      parentMenu: menu.parentMenuId
        ? {
            id: menu.parentMenuId._id,
            menuName_en: menu.parentMenuId.menuName?.en || "",
            menuName_hi: menu.parentMenuId.menuName?.hi || "",
          }
        : null,

      page: menu.pageId
        ? {
            id: menu.pageId._id,
            title: menu.pageId.title || "",
          }
        : null,

      customUrl: menu.customUrl || null,
      order: menu.order || 0,
      isActive: menu.isActive,

      createdBy: menu.createby
        ? {
            id: menu.createby._id,
            name: menu.createby.name || "",
            email: menu.createby.email || "",
          }
        : null,

      updatedBy: menu.updateby
        ? {
            id: menu.updateby._id,
            name: menu.updateby.name || "",
            email: menu.updateby.email || "",
          }
        : null,

      createdAt: menu.createdate,
      updatedAt: menu.updatedate || null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateMenuStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    // update fields
    menu.isActive = isActive;
    menu.updateby = req?.user?._id;
    menu.updatedate = new Date();

    await menu.save();

    return res.status(200).json({
      success: true,
      message: `Menu ${isActive ? "activated" : "deactivated"} successfully`,
      data: menu,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      menuType,
      menuCategory,
      parentMenuId,
      menuName_en,
      menuName_hi,
      pageId,
      customUrl,
      order,
      isActive,
    } = req.body;

    console.log("menuType", pageId);
    console.log("menuCategory", menuCategory);
    console.log("parentMenuId", parentMenuId);
    console.log("menuName_en", menuName_en);
    console.log("menuName_hi", menuName_hi);
    console.log("pageId", pageId);
    console.log("customUrl", customUrl);
    console.log("order", order);

    const menu = await Menu.findById(id);
    if (!menu)
      return res
        .status(404)
        .json({ success: false, message: "Menu not found" });

    // --- Menu name validation ---
    if (menuName_en || menuName_hi) {
      if (!menuName_en || !menuName_hi) {
        return res.status(400).json({
          success: false,
          message: "Both English and Hindi menu names are required",
        });
      }

      const duplicate = await Menu.findOne({
        $or: [{ "menuName.en": menuName_en }, { "menuName.hi": menuName_hi }],
        _id: { $ne: id },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Menu name already exists in English or Hindi",
        });
      }

      menu.menuName = { en: menuName_en, hi: menuName_hi };
    }

    // --- Page / URL validation ---
    // if ((pageId && customUrl) || (!pageId && !customUrl)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Only one of pageId or customUrl should be provided",
    //   });
    // }

    if (customUrl) {
      const urlPattern =
        /^(https?:\/\/)(([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})(\/.*)?$/;
      if (!urlPattern.test(customUrl)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid URL format" });
      }
    }

    // --- Update fields ---
    if (menuType) menu.menuType = menuType;
    if (menuCategory) menu.menuCategory = menuCategory;
    menu.parentMenuId = parentMenuId || null;
    menu.pageId = pageId || null;
    menu.customUrl = customUrl || null;
    if (order !== undefined) menu.order = order;
    if (isActive !== undefined) menu.isActive = isActive;
    menu.updateby = req.user?._id || null;
    menu.updatedate = new Date();

    await menu.save();
    return res.status(200).json({
      success: true,
      message: "Menu updated successfully",
      data: menu,
    });
  } catch (error) {
    console.error("Error updating menu:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// this is use for web
export const getMenusWeb = async (req, res) => {
  try {
    const menus = await Menu.find()
      .populate("parentMenuId", "menuName")
      .populate("pageId", "title")
      .populate("createby", "name email")
      .populate("updateby", "name email")
      .sort({ order: 1 });

    const data = menus.map((menu) => ({
      id: menu._id,
      menuType: menu.menuType,
      menuCategory: menu.menuCategory,

      menuName_en: menu.menuName?.en || "",
      menuName_hi: menu.menuName?.hi || "",

      parentMenu: menu.parentMenuId
        ? {
            id: menu.parentMenuId._id,
            menuName_en: menu.parentMenuId.menuName?.en || "",
            menuName_hi: menu.parentMenuId.menuName?.hi || "",
          }
        : null,

      page: menu.pageId
        ? {
            id: menu.pageId._id,
            title: menu.pageId.title || "",
          }
        : null,

      customUrl: menu.customUrl || null,
      order: menu.order || 0,
      isActive: menu.isActive,

      createdBy: menu.createby
        ? {
            id: menu.createby._id,
            name: menu.createby.name || "",
            email: menu.createby.email || "",
          }
        : null,

      updatedBy: menu.updateby
        ? {
            id: menu.updateby._id,
            name: menu.updateby.name || "",
            email: menu.updateby.email || "",
          }
        : null,

      createdAt: menu.createdate,
      updatedAt: menu.updatedate || null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
