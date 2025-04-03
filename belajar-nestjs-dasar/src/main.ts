import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as mustache from 'mustache-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { ValidationFilter } from './validation/validation.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  app.useLogger(logger);

  app.use(cookieParser('RAHASIA'));

  app.set('views', __dirname + '/../views');
  app.set('view engine', 'html');
  app.engine('html', mustache());

  app.useGlobalFilters(new ValidationFilter());
  // app.useGlobalPipes()
  // app.useGlobalInterceptors()

  const configService = app.get(ConfigService);

  app.enableShutdownHooks();

  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
