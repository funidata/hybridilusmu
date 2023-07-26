import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

(async () => {
  await NestFactory.createApplicationContext(AppModule);
})();
