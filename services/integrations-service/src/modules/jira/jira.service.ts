import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import axios from 'axios';

@Injectable()
export class JiraService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  getAuthorizationUrl(userId: string): string {
    const clientId = this.configService.get('jira.clientId');
    const callbackUrl = this.configService.get('jira.callbackUrl');
    const scope = 'read:jira-work read:jira-user offline_access';
    const state = Buffer.from(userId).toString('base64');
    
    return `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}&response_type=code&prompt=consent`;
  }

  async exchangeCodeForToken(code: string) {
    const clientId = this.configService.get('jira.clientId');
    const clientSecret = this.configService.get('jira.clientSecret');
    const callbackUrl = this.configService.get('jira.callbackUrl');

    const response = await axios.post(
      'https://auth.atlassian.com/oauth/token',
      {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: callbackUrl,
      },
      { headers: { 'Content-Type': 'application/json' } },
    );

    return response.data;
  }

  async getAccessibleResources(accessToken: string) {
    const response = await axios.get(
      'https://api.atlassian.com/oauth/token/accessible-resources',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return response.data;
  }

  async getCurrentUser(accessToken: string, cloudId: string) {
    const response = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return response.data;
  }

  async saveConnection(
    userId: string,
    accessToken: string,
    refreshToken: string,
    cloudId: string,
    siteUrl: string,
    accountId: string,
  ) {
    const oauthConnection = await this.prisma.oAuthConnection.upsert({
      where: { userId_provider: { userId, provider: 'jira' } },
      update: { accessToken, refreshToken, updatedAt: new Date() },
      create: {
        userId,
        provider: 'jira',
        accessToken,
        refreshToken,
        providerUserId: accountId,
      },
    });

    return this.prisma.jiraConnection.upsert({
      where: { connectionId: oauthConnection.id },
      update: {
        jiraSiteUrl: siteUrl,
        jiraCloudId: cloudId,
        jiraAccountId: accountId,
        updatedAt: new Date(),
      },
      create: {
        connectionId: oauthConnection.id,
        jiraSiteUrl: siteUrl,
        jiraCloudId: cloudId,
        jiraAccountId: accountId,
      },
    });
  }

  async isConnected(userId: string): Promise<boolean> {
    const connection = await this.getJiraConnection(userId);
    return !!connection;
  }

  async disconnect(userId: string) {
    await this.prisma.oAuthConnection.deleteMany({
      where: { userId, provider: 'jira' },
    });
  }

  private async getJiraConnection(userId: string) {
    return this.prisma.jiraConnection.findFirst({
      where: { oauthConnection: { userId, provider: 'jira' } },
      include: { oauthConnection: true },
    });
  }
}
