const express = require("express");
const router = express.Router();
const pool = require("../db");

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
router.get("/:id", getProjectById);
router.get("/:id/votes", getProjectVotes);

// Protected routes (Require Authentication & File Handling)
router.post("/", verifyToken, upload.single("image"), createProject);
router.put("/:id", verifyToken, upload.single("image"), updateProject);
router.delete("/:id", verifyToken, deleteProject);
router.post("/:id/vote", verifyToken, voteForProject);


router.get("/:id/my-vote", verifyToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.id;
    const [rows] = await pool.query(
      "SELECT score FROM votes WHERE project_id = ? AND user_id = ?",
      [id, userId]
    );
    res.json({ voted: rows.length > 0, score: rows[0]?.score || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to check vote" });
  }
});

router.get("/:id", getProjectById);          // 👈 generic — comes after
router.get("/:id/votes", getProjectVotes);

// Protected routes (Require Authentication & File Handling)
router.post("/", verifyToken, upload.single("image"), createProject);
router.put("/:id", verifyToken, upload.single("image"), updateProject);
router.delete("/:id", verifyToken, deleteProject);
router.post("/:id/vote", verifyToken, voteForProject);

module.exports = router;