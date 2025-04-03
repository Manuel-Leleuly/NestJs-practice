import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Auth } from 'src/common/auth.decorator';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from 'src/models/contact.model';
import { WebResponse } from 'src/models/web.model';
import { ContactService } from './contact.service';

@Controller('/api/contacts')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Auth() user: User,
    @Body() request: CreateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.create(user, request);
    return {
      data: result,
    };
  }

  @Get('/:contactId')
  @HttpCode(HttpStatus.OK)
  async get(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.get(user, contactId);
    return {
      data: result,
    };
  }

  @Put('/:contactId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() request: UpdateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    request.id = contactId;
    const result = await this.contactService.update(user, request);
    return {
      data: result,
    };
  }

  @Delete('/:contactId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<boolean>> {
    await this.contactService.remove(user, contactId);
    return {
      data: true,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async search(
    @Auth() user: User,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<ContactResponse[]>> {
    const request: SearchContactRequest = {
      name,
      email,
      phone,
      page: page ?? 1,
      size: size ?? 10,
    };

    return this.contactService.search(user, request);
  }
}
