-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('github', 'jira', 'trello');

-- CreateTable
CREATE TABLE "oauth_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "providerUsername" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scopes" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),

    CONSTRAINT "oauth_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_repositories" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "repoId" BIGINT NOT NULL,
    "repoName" TEXT NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "description" TEXT,
    "defaultBranch" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL,
    "language" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "syncCommits" BOOLEAN NOT NULL DEFAULT true,
    "syncPrs" BOOLEAN NOT NULL DEFAULT true,
    "syncIssues" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),

    CONSTRAINT "github_repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_commits" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "commitSha" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "commitMessage" TEXT NOT NULL,
    "committedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "github_commits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_pull_requests" (
    "id" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "prId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "authorUsername" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),
    "mergedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "github_pull_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jira_connections" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "jiraSiteUrl" TEXT NOT NULL,
    "jiraCloudId" TEXT NOT NULL,
    "jiraAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jira_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jira_boards" (
    "id" TEXT NOT NULL,
    "jiraConnectionId" TEXT NOT NULL,
    "boardId" INTEGER NOT NULL,
    "boardName" TEXT NOT NULL,
    "boardType" TEXT NOT NULL,
    "projectKey" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "githubRepoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),

    CONSTRAINT "jira_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jira_sprints" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "sprintId" INTEGER NOT NULL,
    "sprintName" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "completeDate" TIMESTAMP(3),
    "goal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jira_sprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jira_issues" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "sprintId" TEXT,
    "issueId" TEXT NOT NULL,
    "issueKey" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "issueType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT,
    "assigneeId" TEXT,
    "assigneeName" TEXT,
    "assigneeEmail" TEXT,
    "reporterId" TEXT,
    "reporterName" TEXT,
    "storyPoints" INTEGER,
    "labels" TEXT[],
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "jira_issues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_connections_userId_provider_key" ON "oauth_connections"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "github_repositories_connectionId_repoId_key" ON "github_repositories"("connectionId", "repoId");

-- CreateIndex
CREATE UNIQUE INDEX "github_commits_repoId_commitSha_key" ON "github_commits"("repoId", "commitSha");

-- CreateIndex
CREATE UNIQUE INDEX "github_pull_requests_repoId_prNumber_key" ON "github_pull_requests"("repoId", "prNumber");

-- CreateIndex
CREATE UNIQUE INDEX "jira_connections_connectionId_key" ON "jira_connections"("connectionId");

-- CreateIndex
CREATE UNIQUE INDEX "jira_boards_jiraConnectionId_boardId_key" ON "jira_boards"("jiraConnectionId", "boardId");

-- CreateIndex
CREATE UNIQUE INDEX "jira_sprints_boardId_sprintId_key" ON "jira_sprints"("boardId", "sprintId");

-- CreateIndex
CREATE INDEX "jira_issues_assigneeId_idx" ON "jira_issues"("assigneeId");

-- CreateIndex
CREATE INDEX "jira_issues_status_idx" ON "jira_issues"("status");

-- CreateIndex
CREATE UNIQUE INDEX "jira_issues_boardId_issueKey_key" ON "jira_issues"("boardId", "issueKey");

-- AddForeignKey
ALTER TABLE "github_repositories" ADD CONSTRAINT "github_repositories_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "oauth_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_commits" ADD CONSTRAINT "github_commits_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "github_repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_pull_requests" ADD CONSTRAINT "github_pull_requests_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "github_repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jira_connections" ADD CONSTRAINT "jira_connections_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "oauth_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jira_boards" ADD CONSTRAINT "jira_boards_jiraConnectionId_fkey" FOREIGN KEY ("jiraConnectionId") REFERENCES "jira_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jira_boards" ADD CONSTRAINT "jira_boards_githubRepoId_fkey" FOREIGN KEY ("githubRepoId") REFERENCES "github_repositories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jira_sprints" ADD CONSTRAINT "jira_sprints_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "jira_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jira_issues" ADD CONSTRAINT "jira_issues_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "jira_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jira_issues" ADD CONSTRAINT "jira_issues_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "jira_sprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;
