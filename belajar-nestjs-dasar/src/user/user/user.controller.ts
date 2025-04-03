import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpException,
  HttpRedirectResponse,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseFilters,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { Auth } from 'src/auth/auth.decorator';
import {
  LoginUserRequest,
  loginUserRequestValidation,
} from 'src/model/login.model';
import { Roles } from 'src/role/roles.decorator';
import { TimeInterceptor } from 'src/time/time.interceptor';
import { ValidationFilter } from 'src/validation/validation.filter';
import { ValidationPipe } from 'src/validation/validation.pipe';
import { Connection } from '../connection/connection';
import { MailService } from '../mail/mail.service';
import { MemberService } from '../member/member.service';
import { UserRepository } from '../user-repository/user-repository';
import { UserService } from './user.service';

@Controller('/api/users')
export class UserController {
  // @Inject()
  // private userService: UserService;
  constructor(
    private service: UserService,
    private connection: Connection,
    private mailService: MailService,
    @Inject('EmailService') private emailService: MailService,
    private userRepository: UserRepository,
    private memberService: MemberService,
  ) {}

  @Get('/current')
  @Roles(['admin', 'operator'])
  current(@Auth() user: User): Record<string, any> {
    return {
      data: `Hello ${user.first_name} ${user.last_name}`,
    };
  }

  @Post('/login')
  @Header('Content-Type', 'application/json')
  @UseFilters(ValidationFilter)
  @UsePipes(new ValidationPipe(loginUserRequestValidation))
  @UseInterceptors(TimeInterceptor)
  login(@Query('name') name: string, @Body() request: LoginUserRequest) {
    return {
      data: `Hello ${request.username}`,
    };
  }

  @Get('/connection')
  async getConnection(): Promise<string> {
    this.mailService.send();
    this.emailService.send();

    console.info(this.memberService.getConnectionName());
    this.memberService.sendEmail();

    return this.connection.getName();
  }

  @Post('/create')
  async create(
    @Query('first_name') firstName: string,
    @Query('last_name') lastName: string,
  ) {
    if (!firstName) {
      throw new HttpException(
        {
          code: 400,
          errors: 'first name is required',
        },
        400,
      );
    }
    return this.userRepository.save(firstName, lastName);
  }

  @Get('/hello')
  // @UseFilters(ValidationFilter)
  async sayHello(@Query('name') name: string): Promise<string> {
    return this.service.sayHello(name);
  }

  @Get('/view/hello')
  viewHello(@Query('name') name: string, @Res() response: Response) {
    response.render('index.html', {
      title: 'Template Engine',
      name,
    });
  }

  @Get('/set-cookie')
  setCookie(@Query('name') name: string, @Res() response: Response) {
    response.cookie('name', name);
    response.status(200).send('Success Set Cookie');
  }

  @Get('/get-cookie')
  getCookie(@Req() requrest: Request): string {
    return requrest.cookies.name;
  }

  @Get('/sample-response')
  @Header('Content-Type', 'application/json')
  @HttpCode(200)
  sampleResponse(): Record<string, string> {
    return {
      data: 'Sample Response',
    };
  }
  // sampleResponse(@Res() response: Response): void {
  //   response.status(200).send('Sample Response');
  // }

  @Get('/redirect')
  @Redirect()
  redirect(): HttpRedirectResponse {
    return {
      url: '/api/users/sample-response',
      statusCode: 301,
    };
  }

  @Post()
  post(): string {
    return 'POST';
  }

  @Get('/sample')
  get(): string {
    return 'Hello NestJS';
  }

  // @Get('/:id')
  // getId(@Req() request: Request): string {
  //   return `GET ${request.params.id}`;
  // }
  @Get('/:id')
  getById(@Param('id', ParseIntPipe) id: number): string {
    return `GET ${id}`;
  }
}
