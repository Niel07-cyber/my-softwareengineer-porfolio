import { Controller, Get } from '@nestjs/common';
import { profile, type Profile } from './profile.data.js';

@Controller('profile')
export class ProfileController {
  @Get()
  getProfile(): Profile {
    return profile;
  }
}
