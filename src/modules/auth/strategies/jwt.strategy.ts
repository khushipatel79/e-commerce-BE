import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({ // passport jwt setup
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //JWT token request na header thi aavshe
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: any) {  //request.user.role thi access mali sakse
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
