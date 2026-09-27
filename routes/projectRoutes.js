const express = require("express");
const router = express.Router();

// Import auth and file upload middleware
const verifyToken = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    voteForProject,
    getProjectVotes,
    getProjectRankings,
    getCategories
} = require("../controllers/projectController");

// Public routes (Anyone can view)
router.get("/", getProjects);
router.get("/rankings", getProjectRankings);
router.get("/categories", getCategories);


// Protected routes (Require Authentication & File Handling)
router.get("/:id", verifyToken, getProjectById);
router.get("/:id/votes", verifyToken, getProjectVotes);
router.post("/", verifyToken, upload.single("image"), createProject);
router.put("/:id", verifyToken, upload.single("image"), updateProject);
router.delete("/:id", verifyToken, deleteProject);
router.post("/:id/vote", verifyToken, voteForProject);

module.exports = router;