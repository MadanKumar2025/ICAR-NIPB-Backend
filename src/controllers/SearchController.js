import Page from "../models/pageSchema.js";
import News from "../models/NewsSchema.js";
import Event from "../models/EventSchema.js";
import Staff from "../models/StaffSchema.js";
import AboutCentre from "../models/AboutCentreSchema.js";
import Content from "../models/ContentSchema.js";
import PreviousDirector from "../models/PreviousDirectorSchema.js";
import Director from "../models/DirectorSchema.js";
import CadreStrength from "../models/CadreStrengthSchema.js";
import InstitutionalProject from "../models/InstitutionalProjectsSchema.js";
import ExternallyFundedProject from "../models/ExternallyFundedProjectSchema.js";
import Patents from "../models/PatentsSchema.js";
import TechnologiesDeveloped from "../models/TechnologiesDevelopedSchema.js";
import StudentCourse from "../models/StudentCourseSchema.js";
import Student from "../models/StudentSchema.js";

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

    // Search scientists
    const scientists = await Scientist.find({
      $or: [
        { "scientistName.en": { $regex: keyword, $options: "i" } },
        { "scientistName.hi": { $regex: keyword, $options: "i" } },
      ],
    });

    // Search event
    const event = await Event.find({
      $or: [
        { "name.en": { $regex: keyword, $options: "i" } },
        { "name.hi": { $regex: keyword, $options: "i" } },
        { "description.en": { $regex: keyword, $options: "i" } },
        { "description.hi": { $regex: keyword, $options: "i" } },
      ],
    });

    // Search staff
    const staff = await Staff.find({
      $or: [
        { "department.en": { $regex: keyword, $options: "i" } },
        { "department.hi": { $regex: keyword, $options: "i" } },
        { "staffName.en": { $regex: keyword, $options: "i" } },
        { "staffName.hi": { $regex: keyword, $options: "i" } },
        { "designation.en": { $regex: keyword, $options: "i" } },
        { "designation.hi": { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { "education.en": { $regex: keyword, $options: "i" } },
        { "education.hi": { $regex: keyword, $options: "i" } },
        { "Research.en": { $regex: keyword, $options: "i" } },
        { "Research.hi": { $regex: keyword, $options: "i" } },
        { "Awards.en": { $regex: keyword, $options: "i" } },
        { "Awards.hi": { $regex: keyword, $options: "i" } },
        { "Publications.en": { $regex: keyword, $options: "i" } },
        { "Publications.hi": { $regex: keyword, $options: "i" } },
      ],
    });

    // Search About Centre
    const aboutCentre = await AboutCentre.find({
      $or: [
        { "topSection.en": { $regex: keyword, $options: "i" } },
        { "topSection.hi": { $regex: keyword, $options: "i" } },
        { "MediyamSection1.en": { $regex: keyword, $options: "i" } },
        { "MediyamSection1.hi": { $regex: keyword, $options: "i" } },
        { "MediyamSection2.en": { $regex: keyword, $options: "i" } },
        { "MediyamSection2.hi": { $regex: keyword, $options: "i" } },
        { "MediyamSection3.en": { $regex: keyword, $options: "i" } },
        { "MediyamSection3.hi": { $regex: keyword, $options: "i" } },
        { "BotemSection.en": { $regex: keyword, $options: "i" } },
        { "BotemSection.hi": { $regex: keyword, $options: "i" } },
      ],
    });

    // Search Content
    const content = await Content.find({
      $or: [
        { "content.en": { $regex: keyword, $options: "i" } },
        { "content.hi": { $regex: keyword, $options: "i" } },
      ],
    });

    // Search PreviousDirector
    const previousDirector = await PreviousDirector.find({
      $or: [
        { "name.en": { $regex: keyword, $options: "i" } },
        { "name.hi": { $regex: keyword, $options: "i" } },
        { workingPeriod: { $regex: keyword, $options: "i" } },
      ],
    });

    // Search DirectorRoutes
    const directorRoutes = await Director.find({
      $or: [
        { "name.en": { $regex: keyword, $options: "i" } },
        { "name.hi": { $regex: keyword, $options: "i" } },
        { workingPeriod: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
        { education: { $regex: keyword, $options: "i" } },
      ],
    });

    // Search CadreStrengthRoutes
    const cadreStrengthRoutes = await CadreStrength.aggregate([
      {
        $addFields: {
          sanctionedStrengthStr: { $toString: "$sanctionedStrength" },
          filledStr: { $toString: "$filled" },
          vacantStr: { $toString: "$vacant" },
        },
      },
      {
        $match: {
          $or: [
            { "staff.en": { $regex: keyword, $options: "i" } },
            { "staff.hi": { $regex: keyword, $options: "i" } },
            { sanctionedStrengthStr: { $regex: keyword, $options: "i" } },
            { filledStr: { $regex: keyword, $options: "i" } },
            { vacantStr: { $regex: keyword, $options: "i" } },
          ],
        },
      },
    ]);

    // Search InstitutionalProjectsRoutes
    const institutionalProject = await InstitutionalProject.find({
      $or: [
        { "mainProject.en": { $regex: keyword, $options: "i" } },
        { "mainProject.hi": { $regex: keyword, $options: "i" } },
        { "groupLeader.en": { $regex: keyword, $options: "i" } },
        { "groupLeader.hi": { $regex: keyword, $options: "i" } },
      ],
    });

    // Search externallyFundedProject
    const externallyFundedProject = await ExternallyFundedProject.find({
      $or: [
        { "title.en": { $regex: keyword, $options: "i" } },
        { "title.hi": { $regex: keyword, $options: "i" } },
        { "fundingAgency.en": { $regex: keyword, $options: "i" } },
        { "fundingAgency.hi": { $regex: keyword, $options: "i" } },
        { sanctionedBudget: { $regex: keyword, $options: "i" } },
        { principalInvestigator: { $regex: keyword, $options: "i" } },
      ],
    });

    // Search PatentsRoutes
    const patentsRoutes = await Patents.find({
      $or: [
        { "type.en": { $regex: keyword, $options: "i" } },
        { "type.hi": { $regex: keyword, $options: "i" } },
        { "title.en": { $regex: keyword, $options: "i" } },
        { "title.hi": { $regex: keyword, $options: "i" } },
      ],
    });

    // Search TechnologiesDeveloped
    const technologiesDeveloped = await TechnologiesDeveloped.find({
      $or: [
        { "nameOfOtherParty.en": { $regex: keyword, $options: "i" } },
        { "nameOfOtherParty.hi": { $regex: keyword, $options: "i" } },
        { "collaboratingInstituteICAR.en": { $regex: keyword, $options: "i" } },
        { "collaboratingInstituteICAR.hi": { $regex: keyword, $options: "i" } },
        { "nameOfTechnology.en": { $regex: keyword, $options: "i" } },
        { "nameOfTechnology.hi": { $regex: keyword, $options: "i" } },
      ],
    });

    // Search StudentCourse
    const studentCourse = await StudentCourse.find({
      $or: [
        { "courseName.en": { $regex: keyword, $options: "i" } },
        { "courseName.hi": { $regex: keyword, $options: "i" } },
        { "semester.en": { $regex: keyword, $options: "i" } },
        { "semester.hi": { $regex: keyword, $options: "i" } },
      ],
    });
    // Search Student
    const student = await Student.find({
      $or: [
        { "studentName.en": { $regex: keyword, $options: "i" } },
        { "studentName.hi": { $regex: keyword, $options: "i" } },
        { "guideName.en": { $regex: keyword, $options: "i" } },
        { "guideName.hi": { $regex: keyword, $options: "i" } },
        { rollNo: { $regex: keyword, $options: "i" } },
      ],
    });

    const results = [];

    //////////////////////////
    /////////////////////////////
    //////////////////////////
    /////////////////////////////
    //////////////////////////
    /////////////////////////////
    //////////////////////////
    /////////////////////////////
    //////////////////////////
    /////////////////////////////
    //////////////////////////
    /////////////////////////////
    //////////////////////////
    /////////////////////////////

    ///

    //  Pages
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

    // News
    const newsPage = pages.find((p) => p.apiName === "news/get/web");
    news.forEach((n) => {
      results.push({
        title: n.title?.en || n.title?.hi,
        type: "news",
        url: newsPage ? `/${newsPage.slug}` : "/",
        apiName: "news/get/web",
      });
    });

    // Scientists
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

    // Events
    const eventPage = pages.find((p) => p.apiName === "event/get/web");
    const eventUrl = eventPage
      ? `/${eventPage.slug}`
      : (() => {
          const fallback = pages.find((p) => p.apiName === "event/get/web");
          return fallback ? `/${fallback.slug}` : "/event";
        })();

    event.forEach((s) => {
      results.push({
        title: s.name?.en || s.name?.en,
        type: "event",
        url: eventUrl,
        apiName: "event/get/web",
      });
    });

    // Staff Search Results

    const staffPageMap = {};

    pages.forEach((p) => {
      if (!p.apiName) return;

      const parts = p.apiName.split("/");

      const deptName = parts[parts.length - 1]?.trim().toLowerCase();

      if (deptName) {
        staffPageMap[deptName] = p.slug;
      }
    });

    staff.forEach((s) => {
      const departmentName = (s.department?.en || s.department?.hi || "")
        .trim()
        .toLowerCase();

      const slug = staffPageMap[departmentName];

      results.push({
        title:
          s.staffName?.en || s.staffName?.hi || s.department?.en || "Staff",

        type: "staff",

        url: slug ? `/${slug}` : "/staff",

        apiName: `staff/get/web/${s.department?.en || ""}`,
      });
    });

    // AboutCentres
    const AboutCentrePage = pages.find(
      (p) => p.apiName === "AboutCentreRoutes/get/web",
    );
    const AboutCentreUrl = AboutCentrePage
      ? `/${AboutCentrePage.slug}`
      : (() => {
          const fallback = pages.find(
            (p) => p.apiName === "AboutCentreRoutes/get/web",
          );
          return fallback ? `/${fallback.slug}` : "/AboutCentreRoutes";
        })();

    aboutCentre.forEach((s) => {
      results.push({
        title: s.topSection?.en || s.topSection?.hi,
        type: "AboutCentre",
        url: AboutCentreUrl,
        apiName: "AboutCentreRoutes/get/web",
      });
    });

    // content
    const ContentPage = pages.find(
      (p) => p.apiName === "ContentRoutes/get/web",
    );

    content.forEach((c) => {
      const contentUrl = ContentPage
        ? `/${ContentPage.slug}/${c.pageId}`
        : `/content/${c.pageId}`;

      results.push({
        title: c.content?.en || c.content?.hi || "Untitled Content",
        type: "content",
        url: contentUrl,
        pageId: c.pageId,
        apiName: "ContentRoutes/get/web",
      });
    });

    //previousDirector/ Former Directors
    const previousDirectorPage = pages.find(
      (p) => p.apiName === "PreviousDirector/get/web",
    );
    const previousDirectorUrl = previousDirectorPage
      ? `/${previousDirectorPage.slug}`
      : (() => {
          const fallback = pages.find(
            (p) => p.apiName === "PreviousDirector/get/web",
          );
          return fallback ? `/${fallback.slug}` : "/PreviousDirector";
        })();

    previousDirector.forEach((s) => {
      results.push({
        title: s.name?.en || s.name?.hi,
        type: "previousDirector",
        url: previousDirectorUrl,
        apiName: "PreviousDirector/get/web",
      });
    });

    //DirectorRoutes/ Current Director\
    const directorRoutesPage = pages.find(
      (p) => p.apiName === "DirectorRoutes/get/web",
    );
    const directorRoutesUrl = directorRoutesPage
      ? `/${directorRoutesPage.slug}`
      : (() => {
          const fallback = pages.find(
            (p) => p.apiName === "DirectorRoutes/get/web",
          );
          return fallback ? `/${fallback.slug}` : "/DirectorRoutes ";
        })();

    directorRoutes.forEach((s) => {
      results.push({
        title: s.name?.en || s.name?.hi,
        type: "DirectorRoutes ",
        url: directorRoutesUrl,
        apiName: "DirectorRoutes/get/web",
      });
    });

    //cadreStrengthRoutes
    const cadreStrengthRoutesPage = pages.find(
      (p) => p.apiName === "CadreStrengthRoutes/get/web",
    );
    const CadreStrengthRoutesUrl = cadreStrengthRoutesPage
      ? `/${cadreStrengthRoutesPage.slug}`
      : (() => {
          const fallback = pages.find(
            (p) => p.apiName === "CadreStrengthRoutes/get/web",
          );
          return fallback ? `/${fallback.slug}` : "/CadreStrengthRoutes ";
        })();

    cadreStrengthRoutes.forEach((s) => {
      results.push({
        title: s.name?.en || s.name?.hi,
        type: "CadreStrengthRoutes  ",
        url: CadreStrengthRoutesUrl,
        apiName: "CadreStrengthRoutes/get/web",
      });
    });

    //institutionalProject
    const institutionalProjectPage = pages.find(
      (p) => p.apiName === "InstitutionalProjectsRoutes/get/web",
    );
    const institutionalProjectUrl = institutionalProjectPage
      ? `/${institutionalProjectPage.slug}`
      : (() => {
          const fallback = pages.find(
            (p) => p.apiName === "InstitutionalProjectsRoutes/get/web",
          );
          return fallback ? `/${fallback.slug}` : "/institutional-projects";
        })();

    institutionalProject.forEach((s) => {
      results.push({
        title: s.mainProject?.en || s.mainProject?.hi,
        type: "institutionalProject",
        url: institutionalProjectUrl,
        apiName: "InstitutionalProjectsRoutes/get/web",
      });
    });

    //ExternallyFundedProject
    const externallyFundedProjectPage = pages.find(
      (p) => p.apiName === "externallyFundedProject/get/web",
    );
    const externallyFundedProjectUrl = externallyFundedProjectPage
      ? `/${externallyFundedProjectPage.slug}`
      : (() => {
          const fallback = pages.find(
            (p) => p.apiName === "/externallyFundedProject/get/web",
          );
          return fallback ? `/${fallback.slug}` : "/externally-funded";
        })();

    externallyFundedProject.forEach((s) => {
      results.push({
        title: s.title?.en || s.title?.hi,
        type: "externallyFundedProject",
        url: externallyFundedProjectUrl,
        apiName: "externallyFundedProject/get/web",
      });
    });

    //patentsRoutes
    const patentsRoutesPage = pages.find(
      (p) => p.apiName === "PatentsRoutes/get/web",
    );
    const patentsRoutesPageUrl = patentsRoutesPage
      ? `/${patentsRoutesPage.slug}`
      : (() => {
          const fallback = pages.find(
            (p) => p.apiName === "/PatentsRoutes/get/web",
          );
          return fallback ? `/${fallback.slug}` : "/patents";
        })();

    patentsRoutes.forEach((s) => {
      results.push({
        title: s.type?.en || s.type?.hi,
        type: "patentsRoutesPage ",
        url: patentsRoutesPageUrl,
        apiName: "PatentsRoutes/get/web",
      });
    });

    //technologiesDeveloped
    const technologiesDevelopedPage = pages.find(
      (p) => p.apiName === "technologiesDeveloped/get/web",
    );
    const technologiesDevelopedUrl = technologiesDevelopedPage
      ? `/${technologiesDevelopedPage.slug}`
      : (() => {
          const fallback = pages.find(
            (p) => p.apiName === "/technologiesDeveloped/get/web",
          );
          return fallback ? `/${fallback.slug}` : "/technologies-developed";
        })();

    technologiesDeveloped.forEach((s) => {
      results.push({
        title: s.type?.en || s.type?.hi,
        type: "technologiesDeveloped",
        url: technologiesDevelopedUrl,
        apiName: "technologiesDeveloped/get/web",
      });
    });

    //studentCourse
    // const studentCoursePage = pages.find(
    //   (p) => p.apiName === "StudentCourse/get/web",
    // );
    // const studentCourseUrl = studentCoursePage
    //   ? `/${studentCoursePage.slug}`
    //   : (() => {
    //       const fallback = pages.find(
    //         (p) => p.apiName === "/StudentCourse/get/web",
    //       );
    //       return fallback ? `/${fallback.slug}` : "/Student";
    //     })();

    // studentCourse.forEach((s) => {
    //   results.push({
    //     title: s.courseName?.en || s.courseName?.hi,
    //     type: "studentCourse ",
    //     url: studentCourseUrl,
    //     apiName: "StudentCourse/get/web",
    //   });
    // });

    //student
    // const studentPage = pages.find(
    //   (p) => p.apiName === "Student/get/web",
    // );
    // const studentUrl = studentPage
    //   ? `/${studentPage.slug}`
    //   : (() => {
    //       const fallback = pages.find(
    //         (p) => p.apiName === "/Student/get/web",
    //       );
    //       return fallback ? `/${fallback.slug}` : "/Student";
    //     })();

    // student.forEach((s) => {
    //   results.push({
    //     title: s.studentName?.en || s.studentName?.hi,
    //     type: "student  ",
    //     url: studentUrl,
    //     apiName: "Student/get/web",
    //   });
    // });

    // ===
    // Common Student Page URL

    const studentPage = pages.find((p) => p.apiName === "Student/get/web");

    const commonStudentUrl = studentPage ? `/${studentPage.slug}` : "/Student";

    // Student Course

    studentCourse.forEach((s) => {
      results.push({
        title: s.courseName?.en || s.courseName?.hi,
        type: "studentCourse",
        url: commonStudentUrl,
        apiName: "StudentCourse/get/web",
      });
    });

    // Student

    student.forEach((s) => {
      results.push({
        title: s.studentName?.en || s.studentName?.hi,
        type: "student",
        url: commonStudentUrl,
        apiName: "Student/get/web",
      });
    });

    // return res.json(results);
       return res.status(200).json({
      success: true,
      data: results,
    });

   } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Server Error",
      data: [],
    });
  }
};
