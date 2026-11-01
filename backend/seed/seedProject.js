// One-time seed: inserts the 5 showcase projects into MySQL.
// Run from backend/ with:  node seed/seedProjects.js
// Safe to re-run — skips projects whose title already exists.

const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const projects = [
  {
    title: "EcoTrack",
    tagline: "A sustainability tracking app that helps reduce waste.",
    description:
      "EcoTrack helps households and small businesses log daily waste, get personalized reduction tips, and track their footprint over time.",
    team_name: "Green Coders",
    category: "Sustainability",
    techInput: JSON.stringify(["React", "Node.js", "MongoDB"]),
    github_url: "https://github.com/example/ecotrack",
    demo_url: "https://ecotrack.demo.app",
    rating: 4.6,
    votes: 132,
    image: "/uploads/bird.jpg",
  },
  {
    title: "Smart Study",
    tagline: "AI-powered study assistant for students.",
    description:
      "Smart Study turns lecture notes into flashcards, quizzes, and summaries, then schedules spaced-repetition reviews automatically.",
    team_name: "StudyBuddies",
    category: "Education",
    techInput: JSON.stringify(["Next.js", "Python", "PostgreSQL"]),
    github_url: "https://github.com/example/smart-study",
    demo_url: "https://smartstudy.demo.app",
    rating: 4.8,
    votes: 210,
    image: "/uploads/circle.jpg",
  },
  {
    title: "FitLife",
    tagline: "Your personal fitness companion.",
    description:
      "FitLife builds adaptive workout plans, tracks form with pose detection, and syncs progress across devices.",
    team_name: "PulseSquad",
    category: "Health",
    techInput: JSON.stringify(["Flutter", "Firebase"]),
    github_url: "https://github.com/example/fitlife",
    demo_url: "https://fitlife.demo.app",
    rating: 4.3,
    votes: 98,
    image: "/uploads/four.jpg",
  },
  {
    title: "FinDash",
    tagline: "Personal finance dashboard for smarter spending.",
    description:
      "FinDash connects to your accounts, auto-categorizes transactions, and surfaces spending insights weekly.",
    team_name: "MoneyMinds",
    category: "Finance",
    techInput: JSON.stringify(["React", "Express", "MongoDB"]),
    github_url: "https://github.com/example/findash",
    demo_url: "https://findash.demo.app",
    rating: 4.7,
    votes: 154,
    image: "/uploads/flower.jpg",
  },
  {
    title: "MealSync",
    tagline: "Meal planning and sharing made simple.",
    description:
      "MealSync generates weekly meal plans from what's in your fridge and creates shareable shopping lists.",
    team_name: "Kitchen Hackers",
    category: "Lifestyle",
    techInput: JSON.stringify(["Vue.js", "Node.js", "MySQL"]),
    github_url: "https://github.com/example/mealsync",
    demo_url: "https://mealsync.demo.app",
    rating: 4.2,
    votes: 86,
    image: "/uploads/sun.jpg",
  },
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });

  let inserted = 0;
  let skipped = 0;

  for (const p of projects) {
    const [existing] = await conn.execute(
      "SELECT id FROM projects WHERE title = ? LIMIT 1",
      [p.title]
    );

    if (existing.length > 0) {
      console.log(`Skipped (already exists): ${p.title}`);
      skipped++;
      continue;
    }

    await conn.execute(
      `INSERT INTO projects
        (title, tagline, description, team_name, category, techInput,
         github_url, demo_url, rating, votes, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.title,
        p.tagline,
        p.description,
        p.team_name,
        p.category,
        p.techInput,
        p.github_url,
        p.demo_url,
        p.rating,
        p.votes,
        p.image,
      ]
    );

    console.log(`✅ Inserted: ${p.title}`);
    inserted++;
  }

  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}.`);
  await conn.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});