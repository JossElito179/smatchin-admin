import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(user_name: string, password: string) {
    const user = await this.usersService.findByUsername(user_name);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials matching');

    const payload = {
      sub: user.id,
      role: user.role,
      user_name: user.user_name,
    };

    return {
      id: user.id,
      access_token: this.jwtService.sign(payload),
    };
  }
}
