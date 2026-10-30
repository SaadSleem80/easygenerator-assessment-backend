import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from '@src/common/Interceptors/transform.interceptor.js';
import { validationExceptionFactory } from '@src/common/factories/validation-exception.factory.js';
import { AppModule } from '@src/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Init Configuration
  const configService = app.get(ConfigService);

  // Init Logger
  const logger = new Logger('Bootstrap');

  // Implment Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: validationExceptionFactory(),
    }),
  );

  // Implment Cors
  app.enableCors({
    origin: configService
      .get<string>('CORS_ORIGINS')
      ?.split(',')
      .map((origin) => origin.trim()),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Implment CSRF
  app.enableCsrfProtection({
    trustedOrigins:
      configService
        .get<string>('CORS_ORIGINS')
        ?.split(',')
        .map((origin) => origin.trim()) ?? [],
  });

  // Apply Transform Intercptor
  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));

  // Apply Global Prefix
  app.setGlobalPrefix('api');

  // Apply Global Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  // Implment Swagger
  const config = new DocumentBuilder()
    .setTitle(`${configService.get<string>('APP')}`)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'bearer',
    )
    .addSecurityRequirements('bearer')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    jsonDocumentUrl: 'docs/json',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Start application
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  logger.log(
    `Application is running on port: ${configService.get<string>('PORT')}`,
  );
}
await bootstrap();
