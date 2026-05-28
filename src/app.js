import express from "express";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import OrganizationDetailsRoutes from "./routes/OrganizationDetailsRoutes.js";
import NewsRoutes from "./routes/newsRoutes.js";
import EventRoutes from "./routes/eventRoutes.js";
import StaffRoutes from "./routes/StaffRoutes.js";
import albumRoutes from "./routes/albumRoutes.js";
import galleryRoutes from "./routes/GalleryRoutes.js";
import PreviousDirectorRoutes from "./routes/PreviousDirectorRoutes.js";
import DirectorRoutes from "./routes/DirectorRoutes.js";
import externallyFundedProjectRoutes from "./routes/externallyFundedProjectRoutes.js";
import InstitutionalProjectsRoutes from "./routes/InstitutionalProjectsRoutes.js";
import InstitutionalProjectsDetailsRoutes from "./routes/InstitutionalProjectsDetailsRoutes.js";
import TechnologiesDevelopedRoutes from "./routes/TechnologiesDevelopedRoutes.js";
import StudentCourseRoutes from "./routes/StudentCourseRoutes.js";
import StudentRoutes from "./routes/StudentRoutes.js";
import DesignationRoutes from "./routes/DesignationRoutes.js";
import DocumentUploaderRoutes from "./routes/DocumentUploaderRoutes.js";
import ContentRoutes from "./routes/ContentRoutes.js";
import PublicationsRoutes from "./routes/PublicationsRoutes.js";
import ScientistRoutes from "./routes/ScientistRoutes.js";
import AdministrativeStaffRoutes from "./routes/AdministrativeStaffRoutes.js";
import AlumniRoutes from "./routes/AlumniRoutes.js";
import ContractualStaffRoutes from "./routes/ContractualStaffRoutes.js";
import FeedbackSchemaRoutes from "./routes/FeedbackSchemaRoutes.js";
import ExternalLinkRoutes from "./routes/ExternalLinkRoutes.js";
import CollaborationsRoutes from "./routes/CollaborationsRoutes.js";
import CollaborationsDetailsRoutes from "./routes/CollaborationsDetailsRoutes.js";
import AdminMenuMasterRoutes from "./routes/AdminMenuMasterRoutes.js";
import UserPermissionsRoutes from "./routes/UserPermissionsRoutes.js";
import BannerRoutes from "./routes/BannerRoutes.js";
import CadreStrengthRoutes from "./routes/CadreStrengthRoutes.js";
import PatentsRoutes from "./routes/PatentsRoutes.js";
import DisclaimerRoutes from "./routes/DisclaimerRoutes.js";
import AccessibilityStatementRoutes from "./routes/AccessibilityStatementRoutes.js";
import WebsitePoliciesRoutes from "./routes/WebsitePoliciesRoutes.js";
import TermsConditionsRoutes from "./routes/TermsConditionsRoutes.js";
import NRCPBMailRoutes from "./routes/NRCPBMailRoutes.js";
import RelatedLinksRoutes from "./routes/RelatedLinksRoutes.js";
import ScreenReaderAccessRoutes from "./routes/ScreenReaderAccessRoutes.js";
import pioneerRoutes from "./routes/pioneerRoutes.js";
import CommitteesRoutes from "./routes/CommitteesRoutes.js";
import ApiFunctionMappingRoutes from "./routes/ApiFunctionMappingRoutes.js";
import AboutCentreRoutes from "./routes/AboutCentreRoutes.js";
import VigilanceOfficerRoutes from "./routes/VigilanceOfficerRoutes.js";
import HelpRoutes from "./routes/HelpRoutes.js";
import AssociatedOrganizationRoutes from "./routes/AssociatedOrganizationRoutes.js";
import OrganogramRoutes from "./routes/OrganogramRoutes.js";
import PaymentRoutes from "./routes/PaymentRoutes.js";
import PopupRoutes from "./routes/PopupRoutes.js";
import cors from "cors";
import path from "path";

const app = express();

// middleware
app.use(express.json());

app.use(
  cors({
    // origin: "http://localhost:3000",
    origin: ["http://localhost:3000", "http://localhost:3001",],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

// static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// routes
app.use("/api", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/organization", OrganizationDetailsRoutes);
app.use("/api/news", NewsRoutes);
app.use("/api/event", EventRoutes);
app.use("/api/staff", StaffRoutes);
app.use("/api/album", albumRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/PreviousDirector", PreviousDirectorRoutes);
app.use("/api/DirectorRoutes", DirectorRoutes);
app.use("/api/externallyFundedProject", externallyFundedProjectRoutes);
app.use("/api/institutionalprojects", InstitutionalProjectsRoutes);
app.use(
  "/api/institutionalProjectsDetailsRoutes",
  InstitutionalProjectsDetailsRoutes,
);
app.use("/api/technologiesDeveloped", TechnologiesDevelopedRoutes);
app.use("/api/StudentCourse", StudentCourseRoutes);
app.use("/api/Student", StudentRoutes);
app.use("/api/designation", DesignationRoutes);
app.use("/api/DocumentUploaderRoutes", DocumentUploaderRoutes);
app.use("/api/ContentRoutes", ContentRoutes);
app.use("/api/PublicationsRoutes", PublicationsRoutes);
app.use("/api/ScientistRoutes", ScientistRoutes);
app.use("/api/AdministrativeStaffRoutes", AdministrativeStaffRoutes);
app.use("/api/AlumniRoutes", AlumniRoutes);
app.use("/api/ContractualStaffRoutes", ContractualStaffRoutes);
app.use("/api/FeedbackSchemaRoutes", FeedbackSchemaRoutes);
app.use("/api/ExternalLinkRoutes", ExternalLinkRoutes);
app.use("/api/CollaborationsRoutes", CollaborationsRoutes);
app.use("/api/CollaborationsDetailsRoutes", CollaborationsDetailsRoutes);
app.use("/api/AdminMenuMasterRoutes", AdminMenuMasterRoutes);
app.use("/api/UserPermissionsRoutes", UserPermissionsRoutes);
app.use("/api/BannerRoutes", BannerRoutes);
app.use("/api/CadreStrengthRoutes", CadreStrengthRoutes);
app.use("/api/PatentsRoutes", PatentsRoutes);
app.use("/api/DisclaimerRoutes", DisclaimerRoutes);
app.use("/api/AccessibilityStatementRoutes", AccessibilityStatementRoutes);
app.use("/api/WebsitePoliciesRoutes", WebsitePoliciesRoutes);
app.use("/api/TermsConditionsRoutes", TermsConditionsRoutes);
app.use("/api/NRCPBMailRoutes", NRCPBMailRoutes);
app.use("/api/RelatedLinksRoutes", RelatedLinksRoutes);
app.use("/api/ScreenReaderAccessRoutes", ScreenReaderAccessRoutes);
app.use("/api/pioneerRoutes", pioneerRoutes);
app.use("/api/CommitteesRoutes", CommitteesRoutes);
app.use("/api/ApiFunctionMappingRoutes", ApiFunctionMappingRoutes);
app.use("/api/AboutCentreRoutes", AboutCentreRoutes);
app.use("/api/VigilanceOfficerRoutes", VigilanceOfficerRoutes);
app.use("/api/HelpRoutes", HelpRoutes);
app.use("/api/AssociatedOrganizationRoutes", AssociatedOrganizationRoutes);
app.use("/api/OrganogramRoutes", OrganogramRoutes);
app.use("/api/PaymentRoutes", PaymentRoutes);
app.use("/api/PopupRoutes", PopupRoutes);

export default app;
