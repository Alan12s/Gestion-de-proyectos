import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { GitHubModule } from './modules/github/github.module';
import { JiraModule } from './modules/jira/jira.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    GitHubModule,
    JiraModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
