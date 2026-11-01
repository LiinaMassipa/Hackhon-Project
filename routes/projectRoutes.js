const express = require("express");
const router = express.Router();

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

// Public routes
router.get("/", getProjects);
router.get("/rankings", getProjectRankings);
router.get("/categories", getCategories);
router.get("/:id", getProjectById);
router.get("/:id/votes", getProjectVotes);

// Project mutation & voting routes
router.post("/", upload.single("image"), createProject);
router.put("/:id", upload.single("image"), updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/vote", voteForProject);

module.exports = router;
