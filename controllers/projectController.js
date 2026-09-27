const pool = require("../db");

const getProjects = async (req, res) => {
    try {
        const { search, category } = req.query;
        let sql = "SELECT * FROM projects WHERE 1=1";
        const params = [];

        if (search) {
            // Change "name" to "title"
            sql += " AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ?)";
            const searchTerm = `%${search.toLowerCase()}%`;
            params.push(searchTerm, searchTerm);
        }

        if (category) {
            sql += " AND LOWER(category) = ?";
            params.push(category.toLowerCase());
        }

        const [rows] = await pool.query(sql, params);
        res.json({ projects: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve projects" });
    }
};

const createProject = async (req, res) => {
    try {
        // Change "name" to "title" to match your database
        const { title, description, category, githubUrl, demoUrl, teamName } = req.body;

        // Change "name" to "title" in validation
        if (!title || !description || !category) {
            return res.status(400).json({
                message: "Title, description and category are required"
            });
        }

        const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || "");

        // Change "name" to "title" in the SQL query
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
        const [rows] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        res.json(rows[0]);
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
        // Change "title" to match database column
        const title = req.body.title ?? existing.title;
        const description = req.body.description ?? existing.description;
        const category = req.body.category ?? existing.category;
        const githubUrl = req.body.githubUrl ?? existing.github_url;
        const demoUrl = req.body.demoUrl ?? existing.demo_url;
        
        const image = req.file ? `/uploads/${req.file.filename}` : existing.image;

        // Change "title" in the SQL query
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

        const [project] = await pool.query("SELECT * FROM projects WHERE id = ?", [id]);
        if (project.length === 0) {
            return res.status(404).json({ message: "Project not found" });
        }

        if (userId) {
            await pool.query(
                `INSERT INTO votes (project_id, user_id, score) VALUES (?, ?, 1)
                 ON DUPLICATE KEY UPDATE score = score`,
                [id, userId]
            );
        }

        const [voteCount] = await pool.query("SELECT COUNT(*) AS total FROM votes WHERE project_id = ?", [id]);

        res.json({
            message: "Vote recorded successfully",
            projectId: id,
            votes: voteCount[0].total
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

const getProjectRankings = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, COUNT(v.id) AS votes 
            FROM projects p 
            LEFT JOIN votes v ON p.id = v.project_id 
            GROUP BY p.id 
            ORDER BY votes DESC
        `);
        res.json(rows);
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