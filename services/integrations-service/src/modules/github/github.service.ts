import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import axios from 'axios';
import {
  GitHubTokenResponse,
  GitHubUser,
  GitHubRepository,
  GitHubCommit,
  GitHubPullRequest,
} from './interfaces/github.interfaces';

@Injectable()
export class GitHubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  getAuthorizationUrl(userId: string): string {
    const clientId = this.configService.get('github.clientId');
    const callbackUrl = this.configService.get('github.callbackUrl');
    const scope = 'repo,user';
    const state = Buffer.from(userId).toString('base64');
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackUrl}&scope=${scope}&state=${state}`;
  }

  async exchangeCodeForToken(code: string): Promise<GitHubTokenResponse> {
    const clientId = this.configService.get('github.clientId');
    const clientSecret = this.configService.get('github.clientSecret');
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      { client_id: clientId, client_secret: clientSecret, code },
      { headers: { Accept: 'application/json' } },
    );
    return response.data;
  }

  async getGitHubUser(accessToken: string): Promise<GitHubUser> {
    const response = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  async saveConnection(userId: string, accessToken: string, scope: string) {
    const githubUser = await this.getGitHubUser(accessToken);
    return this.prisma.oAuthConnection.upsert({
      where: { userId_provider: { userId, provider: 'github' } },
      update: {
        accessToken,
        scopes: scope.split(','),
        providerUserId: githubUser.id.toString(),
        providerUsername: githubUser.login,
        updatedAt: new Date(),
      },
      create: {
        userId,
        provider: 'github',
        accessToken,
        scopes: scope.split(','),
        providerUserId: githubUser.id.toString(),
        providerUsername: githubUser.login,
      },
    });
  }

  async fetchAvailableRepositories(userId: string): Promise<GitHubRepository[]> {
    const connection = await this.prisma.oAuthConnection.findUnique({
      where: { userId_provider: { userId, provider: 'github' } },
    });
    if (!connection) throw new Error('GitHub no está conectado');

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `Bearer ${connection.accessToken}` },
      params: { sort: 'updated', per_page: 100, affiliation: 'owner,collaborator' },
    });
    return response.data;
  }

  async addRepository(userId: string, repoId: number) {
    const connection = await this.prisma.oAuthConnection.findUnique({
      where: { userId_provider: { userId, provider: 'github' } },
    });
    if (!connection) throw new Error('GitHub no está conectado');

    const repos = await this.fetchAvailableRepositories(userId);
    const repo = repos.find((r) => r.id === repoId);
    if (!repo) throw new Error('Repositorio no encontrado');

    const savedRepo = await this.prisma.gitHubRepository.upsert({
      where: { connectionId_repoId: { connectionId: connection.id, repoId: repo.id } },
      update: {
        repoName: repo.name,
        repoFullName: repo.full_name,
        repoUrl: repo.html_url,
        description: repo.description,
        defaultBranch: repo.default_branch,
        isPrivate: repo.private,
        language: repo.language,
        stars: repo.stargazers_count,
        updatedAt: new Date(),
      },
      create: {
        connectionId: connection.id,
        repoId: repo.id,
        repoName: repo.name,
        repoFullName: repo.full_name,
        repoUrl: repo.html_url,
        description: repo.description,
        defaultBranch: repo.default_branch,
        isPrivate: repo.private,
        language: repo.language,
        stars: repo.stargazers_count,
      },
    });

    await this.syncRepositoryData(connection.accessToken, savedRepo.id, repo.full_name);
    return savedRepo;
  }

  async removeRepository(userId: string, repoId: string) {
    const connection = await this.prisma.oAuthConnection.findUnique({
      where: { userId_provider: { userId, provider: 'github' } },
    });
    if (!connection) throw new Error('GitHub no está conectado');

    await this.prisma.gitHubRepository.delete({
      where: { id: repoId, connectionId: connection.id },
    });
  }

  async syncRepositoryData(accessToken: string, repoId: string, repoFullName: string) {
    const [owner, repo] = repoFullName.split('/');

    try {
      const commits = await this.fetchRepoCommits(accessToken, owner, repo);
      for (const commit of commits.slice(0, 10)) {
        await this.prisma.gitHubCommit.upsert({
          where: { repoId_commitSha: { repoId, commitSha: commit.sha } },
          update: {
            authorName: commit.commit.author.name,
            authorEmail: commit.commit.author.email,
            commitMessage: commit.commit.message,
            committedAt: new Date(commit.commit.author.date),
          },
          create: {
            repoId,
            commitSha: commit.sha,
            authorName: commit.commit.author.name,
            authorEmail: commit.commit.author.email,
            commitMessage: commit.commit.message,
            committedAt: new Date(commit.commit.author.date),
          },
        });
      }

      const prs = await this.fetchRepoPullRequests(accessToken, owner, repo);
      for (const pr of prs) {
        await this.prisma.gitHubPullRequest.upsert({
          where: { repoId_prNumber: { repoId, prNumber: pr.number } },
          update: {
            title: pr.title,
            state: pr.state,
            authorUsername: pr.user.login,
            updatedAt: pr.updated_at ? new Date(pr.updated_at) : null,
          },
          create: {
            repoId,
            prNumber: pr.number,
            prId: pr.id,
            title: pr.title,
            state: pr.state,
            authorUsername: pr.user.login,
            createdAt: pr.created_at ? new Date(pr.created_at) : new Date(),
            updatedAt: pr.updated_at ? new Date(pr.updated_at) : null,
          },
        });
      }

      await this.prisma.gitHubRepository.update({
        where: { id: repoId },
        data: { lastSyncedAt: new Date() },
      });
    } catch (error) {
      console.error(`Error sincronizando ${repoFullName}:`, error.message);
    }
  }

  async getUserRepositories(userId: string) {
    try {
      const connection = await this.prisma.oAuthConnection.findUnique({
        where: { userId_provider: { userId, provider: 'github' } },
      });

      if (!connection) {
        return [];
      }

      const repos = await this.prisma.gitHubRepository.findMany({
        where: { connectionId: connection.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          commits: {
            orderBy: { committedAt: 'desc' },
            take: 5,
          },
          pullRequests: {
            where: { state: 'open' },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return repos;
    } catch (error) {
      console.error('Error obteniendo repositorios:', error);
      return [];
    }
  }

  async getRepositoryDetails(userId: string, repoId: string) {
    const connection = await this.prisma.oAuthConnection.findUnique({
      where: { userId_provider: { userId, provider: 'github' } },
    });

    if (!connection) {
      throw new Error('GitHub no está conectado');
    }

    const repo = await this.prisma.gitHubRepository.findUnique({
      where: { id: repoId },
      include: {
        commits: {
          orderBy: { committedAt: 'desc' },
          take: 20,
        },
        pullRequests: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!repo) {
      throw new Error('Repositorio no encontrado');
    }

    const [owner, repoName] = repo.repoFullName.split('/');
    let issues = [];
    
    try {
      const issuesResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}/issues`,
        {
          headers: { Authorization: `Bearer ${connection.accessToken}` },
          params: { state: 'all', per_page: 20 },
        },
      );
      issues = issuesResponse.data;
    } catch (error) {
      console.error('Error obteniendo issues:', error.message);
    }

    let stats = null;
    try {
      const statsResponse = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}`,
        {
          headers: { Authorization: `Bearer ${connection.accessToken}` },
        },
      );
      stats = {
        openIssuesCount: statsResponse.data.open_issues_count,
        forks: statsResponse.data.forks_count,
        watchers: statsResponse.data.watchers_count,
        size: statsResponse.data.size,
        topics: statsResponse.data.topics || [],
      };
    } catch (error) {
      console.error('Error obteniendo stats:', error.message);
    }

    return {
      repository: repo,
      issues: issues.filter(issue => !issue.pull_request),
      statistics: stats,
    };
  }

  async syncSingleRepository(userId: string, repoId: string) {
    const connection = await this.prisma.oAuthConnection.findUnique({
      where: { userId_provider: { userId, provider: 'github' } },
    });

    if (!connection) {
      throw new Error('GitHub no está conectado');
    }

    const repo = await this.prisma.gitHubRepository.findUnique({
      where: { id: repoId },
    });

    if (!repo) {
      throw new Error('Repositorio no encontrado');
    }

    await this.syncRepositoryData(
      connection.accessToken,
      repo.id,
      repo.repoFullName,
    );
  }

  async fetchRepoCommits(accessToken: string, owner: string, repo: string): Promise<GitHubCommit[]> {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { per_page: 10 },
      },
    );
    return response.data;
  }

  async fetchRepoPullRequests(accessToken: string, owner: string, repo: string): Promise<GitHubPullRequest[]> {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { state: 'open', per_page: 10 },
      },
    );
    return response.data;
  }

  async isConnected(userId: string): Promise<boolean> {
    const connection = await this.prisma.oAuthConnection.findUnique({
      where: { userId_provider: { userId, provider: 'github' } },
    });
    return !!connection;
  }

  async disconnect(userId: string) {
    await this.prisma.oAuthConnection.deleteMany({
      where: { userId, provider: 'github' },
    });
  }
}
