/**
 * TypeScript Interfaces for User Profiles and Project Items
 */

export interface UserMetrics {
  totalProjects: number;
  totalViews: number;
  totalVotes: number;
  averageRating: number;
}

export interface UserSocialLinks {
  github?: string;
  linkedin?: string;
  website?: string;
  twitter?: string;
}

export interface UserProfile {
  id: string | number;
  username: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  headline?: string;
  bio?: string;
  location?: string;
  joinedDate?: string;
  socialLinks?: UserSocialLinks;
  metrics?: UserMetrics;
}

export interface ProjectItem {
  id: string | number;
  _id?: string | number;
  title?: string;
  name?: string;
  tagline?: string;
  description?: string;
  category?: string;
  team?: string;
  userId?: string | number;
  author?: string;
  tech?: string[] | string;
  image?: string;
  image_url?: string;
  github?: string;
  githubUrl?: string;
  demo?: string;
  demoUrl?: string;
  rating?: number;
  votes?: number;
  views?: number;
  createdAt?: string;
  created_at?: string;
}

export type ProjectSortOption = "latest" | "popular" | "rating" | "alphabetical";

