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
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Auth } from 'src/common/auth.decorator';
import {
  AddressResponse,
  CreateAddressRequest,
  GetAddressRequest,
  RemoveAddressRequest,
  UpdateAddressRequest,
} from 'src/models/address.model';
import { WebResponse } from 'src/models/web.model';
import { AddressService } from './address.service';

@Controller('/api/contacts/:contactId/addresses')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() request: CreateAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    request.contact_id = contactId;
    const result = await this.addressService.create(user, request);
    return {
      data: result,
    };
  }

  @Get('/:addressId')
  @HttpCode(HttpStatus.OK)
  async get(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<AddressResponse>> {
    const request: GetAddressRequest = {
      address_id: addressId,
      contact_id: contactId,
    };
    const result = await this.addressService.get(user, request);
    return {
      data: result,
    };
  }

  @Put('/:addressId')
  @HttpCode(HttpStatus.OK)
  async update(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() request: UpdateAddressRequest,
  ): Promise<WebResponse<AddressResponse>> {
    request.contact_id = contactId;
    request.id = addressId;
    const result = await this.addressService.update(user, request);
    return {
      data: result,
    };
  }

  @Delete('/:addressId')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<boolean>> {
    const request: RemoveAddressRequest = {
      address_id: addressId,
      contact_id: contactId,
    };
    await this.addressService.remove(user, request);
    return {
      data: true,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(
    @Auth() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<AddressResponse[]>> {
    const result = await this.addressService.list(user, contactId);
    return {
      data: result,
    };
  }
}
