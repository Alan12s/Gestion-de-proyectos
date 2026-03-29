import { Controller, Get, Post, Delete, Query, Param, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { GitHubService } from './github.service';

@Controller('api/integrations/github')
export class GitHubController {
  constructor(
    private readonly githubService: GitHubService,
    private readonly configService: ConfigService,
  ) {}

  @Get('connect')
  async connect(@Query('userId') userId: string, @Res() res: Response) {
    if (!userId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'userId es requerido',
      });
    }
    const authUrl = this.githubService.getAuthorizationUrl(userId);
    return res.redirect(authUrl);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      const userId = Buffer.from(state, 'base64').toString();
      const tokenData = await this.githubService.exchangeCodeForToken(code);
      
      await this.githubService.saveConnection(
        userId,
        tokenData.access_token,
        tokenData.scope,
      );

      const frontendUrl = this.configService.get('frontend.url');
      return res.redirect(`${frontendUrl}/dashboard?github=connected`);
    } catch (error) {
      console.error('Error en callback:', error);
      const frontendUrl = this.configService.get('frontend.url');
      return res.redirect(`${frontendUrl}/dashboard?github=error`);
    }
  }

  @Get('status')
  async getStatus(@Query('userId') userId: string) {
    const connected = await this.githubService.isConnected(userId);
    return { connected };
  }

  @Get('available')
  async getAvailable(@Query('userId') userId: string) {
    const repos = await this.githubService.fetchAvailableRepositories(userId);
    return { repositories: repos };
  }

  @Get('repositories')
  async getRepositories(@Query('userId') userId: string) {
    const repos = await this.githubService.getUserRepositories(userId);
    return { repositories: repos };
  }

  /**
   * GET /api/integrations/github/repositories/:id
   * Obtener detalles completos de un repositorio específico
   */
  @Get('repositories/:id')
  async getRepositoryDetail(
    @Param('id') repoId: string,
    @Query('userId') userId: string,
  ) {
    const details = await this.githubService.getRepositoryDetails(userId, repoId);
    return details;
  }

  @Post('repositories/add')
  async addRepository(@Body() body: { userId: string; repoId: number }) {
    const repo = await this.githubService.addRepository(body.userId, body.repoId);
    return {
      message: 'Repositorio agregado correctamente',
      repository: repo,
    };
  }

  @Delete('repositories/remove')
  async removeRepository(@Body() body: { userId: string; repoId: string }) {
    await this.githubService.removeRepository(body.userId, body.repoId);
    return { message: 'Repositorio removido correctamente' };
  }

  /**
   * POST /api/integrations/github/repositories/:id/sync
   * Forzar sincronización de un repositorio específico
   */
  @Post('repositories/:id/sync')
  async syncRepository(
    @Param('id') repoId: string,
    @Body() body: { userId: string },
  ) {
    await this.githubService.syncSingleRepository(body.userId, repoId);
    return { message: 'Repositorio sincronizado correctamente' };
  }

  @Get('disconnect')
  async disconnect(@Query('userId') userId: string) {
    await this.githubService.disconnect(userId);
    return { message: 'GitHub desconectado correctamente' };
  }
}
