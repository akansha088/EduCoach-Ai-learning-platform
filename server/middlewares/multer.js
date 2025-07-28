import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads");
  },
  filename(req, file, cb) {
    const id = uuid();
    const extName = path.extname(file.originalname);
    const fileName = `${id}${extName}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["video/mp4", "application/pdf"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

// ✅ Support both 'file' (video) and 'pdf' fields
export const uploadFiles = multer({ storage, fileFilter }).fields([
  { name: "file", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);
