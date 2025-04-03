import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { Connection, createConnection } from './connection/connection';
import { mailService, MailService } from './mail/mail.service';
import { MemberService } from './member/member.service';
import { UserRepository } from './user-repository/user-repository';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: Connection,
      useFactory: createConnection,
      inject: [ConfigService],
    },
    {
      provide: MailService,
      useValue: mailService,
    },
    {
      provide: 'EmailService',
      useExisting: MailService,
    },
    UserRepository,
    MemberService,
  ],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '/api/users/current',
      method: RequestMethod.GET,
    });
  }
}
