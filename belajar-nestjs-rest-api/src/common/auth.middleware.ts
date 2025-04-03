import { Injectable, NestMiddleware } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}

  async use(
    req: Request & { user?: User },
    res: any,
    next: (error?: any) => void,
  ) {
    const token = req.headers['authorization'] as string;
    if (token) {
      const user = await this.prismaService.user.findFirst({
        where: {
          token,
        },
      });

      if (user) req.user = user;
    }

    next();
  }
}
