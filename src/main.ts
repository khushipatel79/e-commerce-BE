import { NestFactory } from '@nestjs/core'; //application create karva mate kaam aave che
import { AppModule } from './app.module'; //Saari controllers, services badhu ahiya thi start thay che
import { ValidationPipe } from '@nestjs/common'; //DTO validation mate kam aave che
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true  //jo user extra fields mokale j DTO ma naa hoy → to e automatically remove thai jase.
  })) // global validation enable kare che

  app.enableCors(); //CORS (Cross-Origin Resource Sharing) enable karvu.

  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('The E-Commerce platform API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(process.env.PORT || 5000);


}
bootstrap(); 
