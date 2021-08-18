import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validating username and password
   * @param credentials
   * @return UserEntity|Null
   */
  async validateUser(credentials: AuthLoginDto): Promise<any> {
    const user = await this.userService.getByUsername(credentials.username);
    if (user) {
      const comparePassword = await bcrypt.compare(
        credentials.password,
        user.password,
      );
      if (comparePassword) {
        return this.login(user);
      }
    }
    return null;
  }

  /**
   * Generate login token
   * @param user
   * @return Object
   */
  async login(user: UserEntity) {
    const payload = { username: user.username, sub: user.id };
    return {
      token: this.jwtService.sign(payload),
    };
  }
}
