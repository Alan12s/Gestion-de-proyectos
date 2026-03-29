import { Module } from '@nestjs/common';
import { GitHubModule } from '../github/github.module';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [GitHubModule],
  controllers: [IntegrationsController],
})
export class IntegrationsModule {}