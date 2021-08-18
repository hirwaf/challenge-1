import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/login.dto';
import { HttpResponse } from '../../helpers/JsonResponse';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login method
   * @param credentials
   */
  @Post('login')
  async login(@Body() credentials: AuthLoginDto) {
    const user = await this.authService.validateUser(credentials);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return HttpResponse('Logged in successfully', user);
  }
}
