/**
 * Interfaces para la integración con GitHub
 */

// Respuesta del token de GitHub
export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

// Usuario de GitHub
export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

// Repositorio de GitHub
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  private: boolean;
  default_branch: string;
  language: string;
  stargazers_count: number;
  updated_at: string;
}

// Commit de GitHub
export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

// Pull Request de GitHub
export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: string;
  user: {
    login: string;
  };
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  html_url: string;
}