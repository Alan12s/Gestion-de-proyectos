import { Controller, Get, Query } from '@nestjs/common';
import { GitHubService } from '../github/github.service';

/**
 * Controlador principal de integraciones
 * Provee endpoints generales para todas las integraciones
 */
@Controller('api/integrations')
export class IntegrationsController {
  constructor(private readonly githubService: GitHubService) {}

  /**
   * GET /api/integrations/status
   * Obtener estado de todas las integraciones
   */
  @Get('status')
  async getAllStatus(@Query('userId') userId: string) {
    const githubConnected = await this.githubService.isConnected(userId);

    return {
      github: {
        connected: githubConnected,
      },
      jira: {
        connected: false,
      },
      trello: {
        connected: false,
      },
    };
  }
}