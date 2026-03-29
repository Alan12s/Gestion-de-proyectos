import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JiraService } from './jira.service';

@Controller('api/integrations/jira')
export class JiraController {
  constructor(
    private readonly jiraService: JiraService,
    private readonly configService: ConfigService,
  ) {}

  @Get('connect')
  async connect(@Query('userId') userId: string, @Res() res: Response) {
    if (!userId) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'userId requerido' });
    }
    const authUrl = this.jiraService.getAuthorizationUrl(userId);
    return res.redirect(authUrl);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      const userId = Buffer.from(state, 'base64').toString();
      const tokenData = await this.jiraService.exchangeCodeForToken(code);
      const resources = await this.jiraService.getAccessibleResources(tokenData.access_token);
      
      if (!resources.length) {
        throw new Error('No se encontraron sitios de Jira');
      }

      const site = resources[0];
      const user = await this.jiraService.getCurrentUser(tokenData.access_token, site.id);
      
      await this.jiraService.saveConnection(
        userId,
        tokenData.access_token,
        tokenData.refresh_token,
        site.id,
        site.url,
        user.accountId,
      );

      const frontendUrl = this.configService.get('frontend.url');
      return res.redirect(`${frontendUrl}/dashboard?jira=connected`);
    } catch (error) {
      console.error('Error en callback Jira:', error);
      const frontendUrl = this.configService.get('frontend.url');
      return res.redirect(`${frontendUrl}/dashboard?jira=error`);
    }
  }

  @Get('status')
  async getStatus(@Query('userId') userId: string) {
    const connected = await this.jiraService.isConnected(userId);
    return { connected };
  }

  @Get('disconnect')
  async disconnect(@Query('userId') userId: string) {
    await this.jiraService.disconnect(userId);
    return { message: 'Jira desconectado' };
  }
}
