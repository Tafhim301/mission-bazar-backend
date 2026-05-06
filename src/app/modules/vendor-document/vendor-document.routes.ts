import { Router } from "express";
import { checkAuth }               from "../../middlewares/checkAuth";
import { vendorDocUpload }         from "../../middlewares/upload";
import { VendorDocumentController } from "./vendor-document.controller";
import { UserRole }                from "../user/user.interface";

const router = Router();

// ── Vendor routes ─────────────────────────────────────────────────────────────
/**
 * Upload a document.
 * Send as multipart/form-data with:
 *   - file: the image file
 *   - type: DocumentType enum value (e.g. "NID_FRONT")
 */
router.post("/",    checkAuth(), vendorDocUpload.single("file"), VendorDocumentController.uploadDocument);
router.get( "/my",  checkAuth(), VendorDocumentController.getMyDocuments);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get(   "/",              checkAuth(UserRole.ADMIN), VendorDocumentController.getAllDocuments);
router.patch( "/:id/approve",  checkAuth(UserRole.ADMIN), VendorDocumentController.approveDocument);
router.patch( "/:id/reject",   checkAuth(UserRole.ADMIN), VendorDocumentController.rejectDocument);

export const vendorDocumentRoutes = router;
