# Hackathon Showcase Platform

Keep in mind the `.env.example` file is a blueprint to fill in local credentials, ensuring no leaks of secrets on GitHub.

## Backend Routes
- `GET /api/projects` - List all projects (supports search and category filtering)
- `GET /api/projects/:id` - Get details of a single project
- `POST /api/projects` - Create a new project (supports image upload via Multer)
- `PUT /api/projects/:id` - Update an existing project
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/projects/:id/vote` - Submit a rating/vote for a project
- `GET /api/projects/rankings` - Get leaderboard rankings
- `GET /api/projects/categories` - Get distinct categories
