import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { decode } from 'punycode';
import { JwtService } from './jwt.service';
import { UsersService } from 'src/users/users.service';

// export function jwtMiddleware(req: Request, res: Response, next: NextFunction)
// {
//     console.log(req.headers);
//     next();
// }

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        const decoded = this.jwtService.verify(token.toString());
        if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
          const { ok, user } = await this.usersService.findById(decoded['id']);
          if (ok) {
            req['user'] = user;
          }
        }
      } catch (e) {}
    }
    next();
  }
}
