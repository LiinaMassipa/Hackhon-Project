/**
 * Mock User Profiles for showcase and local development
 */

export const mockProfiles = {
  // Primary default authenticated user
  1: {
    id: 1,
    username: "alex_rivera",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    headline: "Full-Stack Engineer & Open Source Hacker ⚡",
    bio: "Passionate about creating human-centric digital experiences and green tech solutions. Building scalable apps with React, Node.js, and Cloud Native tools.",
    location: "San Francisco, CA",
    joinedDate: "October 2025",
    socialLinks: {
      github: "https://github.com/alexrivera",
      linkedin: "https://linkedin.com/in/alexrivera",
      website: "https://alexrivera.dev",
      twitter: "https://twitter.com/alexrivera_dev"
    },
    metrics: {
      totalProjects: 3,
      totalViews: 3840,
      totalVotes: 496,
      averageRating: 4.7
    }
  },

  // Public peer user
  2: {
    id: 2,
    username: "sarah_chen",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    headline: "AI & EdTech Researcher 🎓",
    bio: "Exploring how LLMs and cognitive science can revolutionize classroom learning. Hackathon mentor & frontend enthusiast.",
    location: "Austin, TX",
    joinedDate: "January 2026",
    socialLinks: {
      github: "https://github.com/sarahchen-ai",
      linkedin: "https://linkedin.com/in/sarahchen",
      website: "https://sarahchen.io"
    },
    metrics: {
      totalProjects: 2,
      totalViews: 1950,
      totalVotes: 240,
      averageRating: 4.5
    }
  },

  // User with zero projects (to test empty state)
  3: {
    id: 3,
    username: "jordan_lee",
    name: "Jordan Lee",
    email: "jordan.lee@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    headline: "Frontend Junior Explorer 🚀",
    bio: "Aspiring developer eager to enter my first hackathon and build something that solves real-world issues.",
    location: "Seattle, WA",
    joinedDate: "September 2026",
    socialLinks: {
      github: "https://github.com/jordanlee",
      website: "https://jordanlee.me"
    },
    metrics: {
      totalProjects: 0,
      totalViews: 0,
      totalVotes: 0,
      averageRating: 0.0
    }
  }
};

export const defaultCurrentUser = mockProfiles[1];

