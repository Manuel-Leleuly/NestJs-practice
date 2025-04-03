import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Address, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  ContactService,
  getSelectedContactOrThrow,
} from 'src/contact/contact.service';
import {
  AddressResponse,
  CreateAddressRequest,
  GetAddressRequest,
  RemoveAddressRequest,
  UpdateAddressRequest,
} from 'src/models/address.model';
import { Logger } from 'winston';
import { AddressValidation } from './address.validation';

@Injectable()
export class AddressService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private contactService: ContactService,
  ) {}

  async create(
    user: User,
    request: CreateAddressRequest,
  ): Promise<AddressResponse> {
    this.logger.debug(
      `AddressService.create(${JSON.stringify(user)}, ${JSON.stringify(request)})`,
    );
    const createRequest = this.validationService.validate(
      AddressValidation.CREATE,
      request,
    );

    await getSelectedContactOrThrow({
      prismaService: this.prismaService,
      username: user.username,
      contactId: createRequest.contact_id,
    });
    const address = await this.prismaService.address.create({
      data: createRequest,
    });

    return toAddressResponse(address);
  }

  async get(user: User, request: GetAddressRequest): Promise<AddressResponse> {
    const getRequest = this.validationService.validate(
      AddressValidation.GET,
      request,
    );
    await getSelectedContactOrThrow({
      prismaService: this.prismaService,
      username: user.username,
      contactId: getRequest.contact_id,
    });

    const address = await getSelectedAddressOrThrow({
      prismaService: this.prismaService,
      addressId: getRequest.address_id,
      contactId: getRequest.contact_id,
    });

    return toAddressResponse(address);
  }

  async update(
    user: User,
    request: UpdateAddressRequest,
  ): Promise<AddressResponse> {
    const updateRequest = this.validationService.validate(
      AddressValidation.UPDATE,
      request,
    );
    await getSelectedContactOrThrow({
      prismaService: this.prismaService,
      username: user.username,
      contactId: updateRequest.contact_id,
    });

    let address = await getSelectedAddressOrThrow({
      prismaService: this.prismaService,
      addressId: updateRequest.id,
      contactId: updateRequest.contact_id,
    });

    address = await this.prismaService.address.update({
      where: {
        id: address.id,
        contact_id: address.contact_id,
      },
      data: updateRequest,
    });

    return toAddressResponse(address);
  }

  async remove(
    user: User,
    request: RemoveAddressRequest,
  ): Promise<AddressResponse> {
    const removeRequest = this.validationService.validate(
      AddressValidation.DELETE,
      request,
    );
    await getSelectedContactOrThrow({
      prismaService: this.prismaService,
      username: user.username,
      contactId: removeRequest.contact_id,
    });
    await getSelectedAddressOrThrow({
      prismaService: this.prismaService,
      addressId: removeRequest.address_id,
      contactId: removeRequest.contact_id,
    });

    const address = await this.prismaService.address.delete({
      where: {
        id: removeRequest.address_id,
        contact_id: removeRequest.contact_id,
      },
    });

    return toAddressResponse(address);
  }

  async list(user: User, contactId: number): Promise<AddressResponse[]> {
    await getSelectedContactOrThrow({
      contactId,
      prismaService: this.prismaService,
      username: user.username,
    });

    const addresses = await this.prismaService.address.findMany({
      where: {
        contact_id: contactId,
      },
    });

    return addresses.map(toAddressResponse);
  }
}

// helpers
const toAddressResponse = (address: Address): AddressResponse => {
  return {
    id: address.id,
    street: address.street,
    city: address.city,
    province: address.province,
    country: address.country,
    postal_code: address.postal_code,
  };
};

const getSelectedAddressOrThrow = async ({
  prismaService,
  addressId,
  contactId,
}: {
  prismaService: PrismaService;
  addressId: number;
  contactId: number;
}): Promise<Address> => {
  const address = await prismaService.address.findFirst({
    where: {
      id: addressId,
      contact_id: contactId,
    },
  });
  if (!address) {
    throw new HttpException('Address is not found', HttpStatus.NOT_FOUND);
  }

  return address;
};
