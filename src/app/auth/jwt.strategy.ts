import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Validating token data
   * @param payload
   * @return Object|UnauthorizedException
   */
  async validate(payload: any) {
    try {
      const user = await this.userService.getById(payload.sub);
      if (user) {
        return { id: user.id, username: user.username };
      }
    } catch (e) {
      console.error(e);
    }
    throw new UnauthorizedException();
  }
}
