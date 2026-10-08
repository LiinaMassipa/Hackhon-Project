const pool = require("../db");

const getProjects = async (req, res) => {
  try {
    const { search, category } = req.query;
    let sql = `
      SELECT p.*,
             COALESCE((SELECT COUNT(*) FROM votes v WHERE v.project_id = p.id), 0) AS real_votes,
             COALESCE((SELECT AVG(v.score) FROM votes v WHERE v.project_id = p.id), p.rating, 0) AS real_rating
      FROM projects p
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += " AND (LOWER(p.title) LIKE ? OR LOWER(p.description) LIKE ?)";
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term);
    }

    if (category) {
      sql += " AND LOWER(p.category) = ?";
      params.push(category.toLowerCase());
    }

    sql += " ORDER BY p.id ASC";

    const [rows] = await pool.query(sql, params);
    const projects = rows.map((r) => ({
      ...r,
      votes: r.real_votes,
      rating: Number(r.real_rating || 0).toFixed(2),
      real_votes: undefined,
      real_rating: undefined,
    }));

    res.json({ projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve projects" });
  }
};

const createProject = async (req, res) => {
    try {
        const { title, description, category, githubUrl, demoUrl, teamName } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({
                message: "Title, description and category are required"
            });
        }

        const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || "");

        const [result] = await pool.query(
            `INSERT INTO projects (title, description, category, github_url, demo_url, image, team_name) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, description, category, githubUrl || "", demoUrl || "", image, teamName || ""]
        );

        res.status(201).json({
            id: result.insertId,
            title,
            description,
            category,
            githubUrl: githubUrl || "",
            demoUrl: demoUrl || "",
            image
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create project" });
    }
};

const getProjectById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [rows] = await pool.query(
            `SELECT p.*,
                    COALESCE((SELECT COUNT(*) FROM votes v WHERE v.project_id = p.id), 0) AS real_votes,
                    COALESCE((SELECT AVG(v.score) FROM votes v WHERE v.project_id = p.id), p.rating, 0) AS real_rating
             FROM projects p
             WHERE p.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        const project = rows[0];
        project.votes = project.real_votes;
        project.rating = Number(project.real_rating || 0).toFixed(2);
        delete project.real_votes;
        delete project.real_rating;

        res.json(project);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve project" });
    }
};

const updateProject = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [rows] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        const existing = rows[0];
        const title = req.body.title ?? existing.title;
        const description = req.body.description ?? existing.description;
        const category = req.body.category ?? existing.category;
        const githubUrl = req.body.githubUrl ?? existing.github_url;
        const demoUrl = req.body.demoUrl ?? existing.demo_url;

        const image = req.file ? `/uploads/${req.file.filename}` : existing.image;

        await pool.query(
            `UPDATE projects SET title=?, description=?, category=?, github_url=?, demo_url=?, image=? WHERE id=?`,
            [title, description, category, githubUrl, demoUrl, image, id]
        );

        res.json({ id, title, description, category, githubUrl, demoUrl, image });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update project" });
    }
};

const deleteProject = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [rows] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        await pool.query("DELETE FROM projects WHERE id = ?", [id]);

        res.json({
            message: "Project deleted successfully",
            project: rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete project" });
    }
};

const voteForProject = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user ? req.user.id : null;
    const score = parseInt(req.body.rating, 10);

    if (!userId) {
      return res.status(401).json({ message: "Login required to vote" });
    }

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const [project] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);
    if (project.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Vote can be updated by the same user
    await pool.query(
      `INSERT INTO votes (project_id, user_id, score)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE score = VALUES(score)`,
      [id, userId, score]
    );

    const [voteCount] = await pool.query(
      "SELECT COUNT(*) AS total FROM votes WHERE project_id = ?",
      [id]
    );
    const [avgRow] = await pool.query(
      "SELECT AVG(score) AS avg_score FROM votes WHERE project_id = ?",
      [id]
    );

    res.json({
      message: "Vote recorded successfully",
      projectId: id,
      votes: voteCount[0].total,
      rating: Number(avgRow[0].avg_score || 0).toFixed(2),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to record vote" });
  }
};

const getProjectVotes = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const [voteCount] = await pool.query("SELECT COUNT(*) AS total FROM votes WHERE project_id = ?", [id]);

        res.json({
            projectId: id,
            votes: voteCount[0].total
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve votes" });
    }
};

// ✅ FIXED — now also computes live rating from the votes table
const getProjectRankings = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*,
                   COUNT(v.id) AS real_votes,
                   COALESCE(AVG(v.score), p.rating, 0) AS real_rating
            FROM projects p
            LEFT JOIN votes v ON p.id = v.project_id
            GROUP BY p.id
            ORDER BY real_votes DESC, real_rating DESC
        `);

        const projects = rows.map((r) => ({
            ...r,
            votes: r.real_votes,
            rating: Number(r.real_rating || 0).toFixed(2),
            real_votes: undefined,
            real_rating: undefined,
        }));

        res.json(projects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve rankings" });
    }
};

const getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT DISTINCT category FROM projects WHERE category IS NOT NULL AND category != ''");
        res.json(rows.map(r => r.category));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve categories" });
    }
};

module.exports = {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    voteForProject,
    getProjectVotes,
    getProjectRankings,
    getCategories
};