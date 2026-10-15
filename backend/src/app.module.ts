import { Module } from '@nestjs/common';
import { ProfileController } from './profile/profile.controller.js';

@Module({
  controllers: [ProfileController],
})
export class AppModule {}
