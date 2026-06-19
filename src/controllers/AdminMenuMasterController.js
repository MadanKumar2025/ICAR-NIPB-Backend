import AdminMenuMaster from "../models/AdminMenuMasterSchema.js";
import mongoose from "mongoose";

// export const createAdminMenu = async (req, res) => {
//   try {
//     let {
//       menuName,
//       url,
//       displayOrderNumber,
//       parentMenuId,
//       menuType,
//       isActive,
//     } = req.body || {};

//     // Normalize inputs
//     menuName = menuName?.trim();
//     url = url?.trim();

//     // Basic required checks (only essential)
//     if (!menuName) {
//       return res.status(400).json({
//         success: false,
//         message: "Menu Name is required",
//       });
//     }
//     if (displayOrderNumber === undefined || displayOrderNumber === null) {
//       return res.status(400).json({
//         success: false,
//         message: "Display Order Number is required",
//       });
//     }

//     if (!menuType) {
//       return res.status(400).json({
//         success: false,
//         message: "Menu Type is required",
//       });
//     }

//     // Number conversion safety (important if coming from form-data)
//     displayOrderNumber = Number(displayOrderNumber);

//     if (isNaN(displayOrderNumber) || displayOrderNumber < 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Display Order Number must be a valid number",
//       });
//     }

//     const existingMenuName = await AdminMenuMaster.findOne({
//       menuName: { $regex: `^${menuName}$`, $options: "i" },
//     });

//     if (existingMenuName) {
//       return res.status(409).json({
//         success: false,
//         message: "Menu Name already exists",
//       });
//     }

//     // Parent handling
//     let parent = null;

//     if (parentMenuId) {
//       if (!mongoose.Types.ObjectId.isValid(parentMenuId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid Parent Menu Id",
//         });
//       }

//       parent = await AdminMenuMaster.findById(parentMenuId);

//       if (!parent) {
//         return res.status(404).json({
//           success: false,
//           message: "Parent Menu not found",
//         });
//       }
//     }
//     const existingOrder = await AdminMenuMaster.findOne({
//       displayOrderNumber,
//       parentMenuId: parent ? parent._id : null,
//     });

//     if (existingOrder) {
//       return res.status(409).json({
//         success: false,
//         message:
//           "This display order number is already used in the same menu level",
//       });
//     }
    
//     parent = await AdminMenuMaster.findById(parentMenuId);

//     // Duplicate URL (case-insensitive exact match)
//     // const existingMenu = await AdminMenuMaster.findOne({
//     //   url: { $regex: `^${url}$`, $options: "i" },
//     // });

//     if (existingMenu) {
//       return res.status(409).json({
//         success: false,
//         message: "Menu with this URL already exists",
//       });
//     }

//     // Duplicate order under same parent
//     const existingOrder = await AdminMenuMaster.findOne({
//       displayOrderNumber,
//       parentMenuId: parent ? parent._id : null,
//     });

//     if (existingOrder) {
//       return res.status(409).json({
//         success: false,
//         message: "This display order number is already used in this menu level",
//       });
//     }

//     // Create document (schema handles defaults)
//     const newMenu = await AdminMenuMaster.create({
//       menuName,
//       url,
//       menuType,
//       displayOrderNumber,
//       parentMenuId: parent ? parent._id : null,
//       isActive: isActive ?? true,
//       createdBy: req.user?.id || null,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Admin menu created successfully",
//       data: newMenu,
//     });
//   } catch (err) {
//     console.error("Create AdminMenu Error =>", err);

//     // Mongoose validation error handling
//     if (err.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         message: Object.values(err.errors)
//           .map((e) => e.message)
//           .join(", "),
//       });
//     }

//     // Duplicate key error (unique index)
//     if (err.code === 11000) {
//       return res.status(409).json({
//         success: false,
//         message: "Duplicate field value detected",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: err.message || "Server Error",
//     });
//   }
// };

export const createAdminMenu = async (req, res) => {
  try {
    let {
      menuName,
      url,
      displayOrderNumber,
      parentMenuId,
      menuType,
      isActive,
    } = req.body;

    // Normalize data
    menuName = menuName?.trim();
    url = url?.trim();

    // Required fields validation
    if (!menuName) {
      return res.status(400).json({
        success: false,
        message: "Menu Name is required",
      });
    }

    if (displayOrderNumber === undefined || displayOrderNumber === null) {
      return res.status(400).json({
        success: false,
        message: "Display Order Number is required",
      });
    }

    if (!menuType) {
      return res.status(400).json({
        success: false,
        message: "Menu Type is required",
      });
    }

    // Convert to number
    displayOrderNumber = Number(displayOrderNumber);

    if (isNaN(displayOrderNumber) || displayOrderNumber < 0) {
      return res.status(400).json({
        success: false,
        message: "Display Order Number must be a valid number",
      });
    }

    // Check duplicate menu name
    const existingMenuName = await AdminMenuMaster.findOne({
      menuName: { $regex: `^${menuName}$`, $options: "i" },
    });

    if (existingMenuName) {
      return res.status(409).json({
        success: false,
        message: "Menu Name already exists",
      });
    }

    // Check duplicate URL (if provided)
    if (url) {
      const existingMenu = await AdminMenuMaster.findOne({
        url: { $regex: `^${url}$`, $options: "i" },
      });

      if (existingMenu) {
        return res.status(409).json({
          success: false,
          message: "Menu with this URL already exists",
        });
      }
    }

    // Parent menu validation
    let parent = null;

    if (parentMenuId) {
      if (!mongoose.Types.ObjectId.isValid(parentMenuId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid Parent Menu Id",
        });
      }

      parent = await AdminMenuMaster.findById(parentMenuId);

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent Menu not found",
        });
      }
    }

    // Check display order duplication under same parent
    const existingOrder = await AdminMenuMaster.findOne({
      displayOrderNumber,
      parentMenuId: parent ? parent._id : null,
    });

    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message:
          "This display order number is already used in the same menu level",
      });
    }

    // Create menu
    const newMenu = await AdminMenuMaster.create({
      menuName,
      url,
      menuType,
      displayOrderNumber,
      parentMenuId: parent ? parent._id : null,
      isActive: isActive ?? true,
      createdBy: req.user?.id || null,
    });

    return res.status(201).json({
      success: true,
      message: "Admin Menu created successfully",
      data: newMenu,
    });
  } catch (err) {
    console.error("Create Admin Menu Error =>", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate value already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

export const getAdminMenus = async (req, res) => {
  try {
    const isAll = req.query.all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = AdminMenuMaster.find()
      .sort({ displayOrderNumber: 1 })
      .populate("parentMenuId", "menuName url")
      .populate("createdBy", "name email");

    const totalMenus = await AdminMenuMaster.countDocuments();

    let menus;

    if (isAll) {
      menus = await query;
    } else {
      menus = await query.skip(skip).limit(limit);
    }

    return res.status(200).json({
      success: true,
      count: menus.length,
      total: totalMenus,
      page: isAll ? null : page,
      totalPages: isAll ? 1 : Math.ceil(totalMenus / limit),
      data: menus,
    });
  } catch (error) {
    console.error("Get Admin Menus Error =>", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

// export const updateAdminMenu = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const {
//       menuName,
//       url,
//       displayOrderNumber,
//       parentMenuId,
//       menuType,
//       isActive,
//     } = req.body;

//     const menu = await AdminMenuMaster.findById(id);

//     if (!menu) {
//       return res.status(404).json({
//         success: false,
//         message: "Menu not found",
//       });
//     }

//     // MENU NAME
//     if (menuName !== undefined) {
//       if (!menuName.trim()) {
//         return res.status(400).json({
//           success: false,
//           message: "menuName cannot be empty",
//         });
//       }
//       menu.menuName = menuName.trim();
//     }

//     // URL

//     // if (url) {
//     // if (!url.trim()) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: "url cannot be empty",
//     //   });
//     // }
//     menu.url = url.trim();

//     // DISPLAY ORDER
//     if (displayOrderNumber !== undefined) {
//       const num = Number(displayOrderNumber);

//       if (Number.isNaN(num) || num < 0) {
//         return res.status(400).json({
//           success: false,
//           message: "displayOrderNumber must be a valid number",
//         });
//       }

//       menu.displayOrderNumber = num;
//     }

//     // MENU TYPE
//     if (menuType !== undefined) {
//       if (!menuType.trim()) {
//         return res.status(400).json({
//           success: false,
//           message: "menuType cannot be empty",
//         });
//       }
//       menu.menuType = menuType.trim();
//     }

//     // PARENT MENU
//     // if (parentMenuId !== undefined) {
//     //   if (parentMenuId === null || parentMenuId === "") {
//     //     menu.parentMenuId = null;
//     //   } else {
//     //     if (!mongoose.Types.ObjectId.isValid(parentMenuId)) {
//     //       return res.status(400).json({
//     //         success: false,
//     //         message: "Invalid parentMenuId",
//     //       });
//     //     }

//     //     const parent = await AdminMenuMaster.findById(parentMenuId);

//     //     if (!parent) {
//     //       return res.status(400).json({
//     //         success: false,
//     //         message: "Parent menu not found",
//     //       });
//     //     }

//     //     menu.parentMenuId = parentMenuId;
//     //   }
//     // }
//     const parent = await AdminMenuMaster.findById(parentMenuId);

//     // IS ACTIVE
//     if (isActive !== undefined) {
//       menu.isActive = isActive === "true" || isActive === true;
//     }

//     // SYSTEM FIELDS
//     menu.updatedBy = req.user?.id || null;
//     menu.updatedAt = Date.now();

//     const updatedMenu = await menu.save();

//     return res.status(200).json({
//       success: true,
//       message: "Menu updated successfully",
//       data: updatedMenu,
//     });
//   } catch (error) {
//     console.error("updateAdminMenu error:", error);

//     if (error.code === 11000) {
//       const field = Object.keys(error.keyValue)[0];
//       return res.status(400).json({
//         success: false,
//         message: `${field} already exists`,
//       });
//     }

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map((val) => val.message);

//       return res.status(400).json({
//         success: false,
//         message: messages.join(", "),
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong",
//     });
//   }
// };


export const updateAdminMenu = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid menu id",
      });
    }

    const {
      menuName,
      url,
      displayOrderNumber,
      parentMenuId,
      menuType,
      isActive,
    } = req.body;

    const menu = await AdminMenuMaster.findById(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    // MENU NAME
    if (menuName !== undefined) {
      const trimmedName = menuName.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Menu Name cannot be empty",
        });
      }

      const existingName = await AdminMenuMaster.findOne({
        _id: { $ne: id },
        menuName: { $regex: `^${trimmedName}$`, $options: "i" },
      });

      if (existingName) {
        return res.status(409).json({
          success: false,
          message: "Menu Name already exists",
        });
      }

      menu.menuName = trimmedName;
    }

    // URL
    if (url !== undefined) {
      const trimmedUrl = url?.trim();

      if (trimmedUrl) {
        const existingUrl = await AdminMenuMaster.findOne({
          _id: { $ne: id },
          url: { $regex: `^${trimmedUrl}$`, $options: "i" },
        });

        if (existingUrl) {
          return res.status(409).json({
            success: false,
            message: "Menu URL already exists",
          });
        }
      }

      menu.url = trimmedUrl || "";
    }

    // DISPLAY ORDER
    if (displayOrderNumber !== undefined) {
      const num = Number(displayOrderNumber);

      if (isNaN(num) || num < 0) {
        return res.status(400).json({
          success: false,
          message: "Display Order Number must be a valid number",
        });
      }

      menu.displayOrderNumber = num;
    }

    // MENU TYPE
    if (menuType !== undefined) {
      const trimmedType = menuType.trim();

      if (!trimmedType) {
        return res.status(400).json({
          success: false,
          message: "Menu Type cannot be empty",
        });
      }

      menu.menuType = trimmedType;
    }

    // PARENT MENU
    if (parentMenuId !== undefined) {
      if (parentMenuId === "" || parentMenuId === null) {
        menu.parentMenuId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(parentMenuId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid Parent Menu Id",
          });
        }

        if (parentMenuId === id) {
          return res.status(400).json({
            success: false,
            message: "Menu cannot be parent of itself",
          });
        }

        const parent = await AdminMenuMaster.findById(parentMenuId);

        if (!parent) {
          return res.status(404).json({
            success: false,
            message: "Parent Menu not found",
          });
        }

        menu.parentMenuId = parentMenuId;
      }
    }

    // CHECK DISPLAY ORDER DUPLICATE
    const existingOrder = await AdminMenuMaster.findOne({
      _id: { $ne: id },
      displayOrderNumber: menu.displayOrderNumber,
      parentMenuId: menu.parentMenuId || null,
    });

    if (existingOrder) {
      return res.status(409).json({
        success: false,
        message:
          "This display order number is already used in the same menu level",
      });
    }

    // IS ACTIVE
    if (isActive !== undefined) {
      menu.isActive = isActive === true || isActive === "true";
    }

    menu.updatedBy = req.user?.id || null;
    menu.updatedAt = new Date();

    const updatedMenu = await menu.save();

    return res.status(200).json({
      success: true,
      message: "Menu updated successfully",
      data: updatedMenu,
    });
  } catch (error) {
    console.error("updateAdminMenu error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate value already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};