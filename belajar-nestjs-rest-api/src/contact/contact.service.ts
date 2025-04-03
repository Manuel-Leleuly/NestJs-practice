import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Contact, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from 'src/models/contact.model';
import { WebResponse } from 'src/models/web.model';
import { Logger } from 'winston';
import { ContactValidation } from './contact.validation';

@Injectable()
export class ContactService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async create(
    user: User,
    request: CreateContactRequest,
  ): Promise<ContactResponse> {
    this.logger.debug(
      `ContactService.create(${JSON.stringify(user)}, ${JSON.stringify(request)})`,
    );
    const createRequest = this.validationService.validate(
      ContactValidation.CREATE,
      request,
    );
    const contact = await this.prismaService.contact.create({
      data: {
        ...createRequest,
        username: user.username,
      },
    });

    return toContactResponse(contact);
  }

  async get(user: User, contactId: number): Promise<ContactResponse> {
    const contact = await getSelectedContactOrThrow({
      prismaService: this.prismaService,
      contactId,
      username: user.username,
    });
    return toContactResponse(contact);
  }

  async update(
    user: User,
    request: UpdateContactRequest,
  ): Promise<ContactResponse> {
    const updateRequest = this.validationService.validate(
      ContactValidation.UPDATE,
      request,
    );
    let contact = await getSelectedContactOrThrow({
      prismaService: this.prismaService,
      contactId: updateRequest.id,
      username: user.username,
    });

    contact = await this.prismaService.contact.update({
      where: {
        id: contact.id,
        username: contact.username,
      },
      data: updateRequest,
    });

    return toContactResponse(contact);
  }

  async remove(user: User, contactId: number): Promise<ContactResponse> {
    await getSelectedContactOrThrow({
      prismaService: this.prismaService,
      username: user.username,
      contactId,
    });
    const contact = await this.prismaService.contact.delete({
      where: {
        id: contactId,
        username: user.username,
      },
    });

    return toContactResponse(contact);
  }

  async search(
    user: User,
    request: SearchContactRequest,
  ): Promise<WebResponse<ContactResponse[]>> {
    const searchRequest = this.validationService.validate(
      ContactValidation.SEARCH,
      request,
    );
    const filters: any[] = [];

    if (searchRequest.name) {
      // add name filter
      filters.push({
        OR: [
          {
            first_name: {
              contains: searchRequest.name,
            },
          },
          {
            last_name: {
              contains: searchRequest.name,
            },
          },
        ],
      });
    }

    if (searchRequest.email) {
      // add email filter
      filters.push({
        email: {
          contains: searchRequest.email,
        },
      });
    }

    if (searchRequest.phone) {
      // add phone filter
      filters.push({
        phone: {
          contains: searchRequest.phone,
        },
      });
    }

    const skip = (searchRequest.page - 1) * searchRequest.size;

    const contacts = await this.prismaService.contact.findMany({
      where: {
        username: user.username,
        AND: filters,
      },
      take: searchRequest.size,
      skip,
    });

    const total = await this.prismaService.contact.count({
      where: {
        username: user.username,
        AND: filters,
      },
    });

    return {
      data: contacts.map(toContactResponse),
      paging: {
        current_page: searchRequest.page,
        size: searchRequest.size,
        total_page: Math.ceil(total / searchRequest.size),
      },
    };
  }
}

// helpers
const toContactResponse = (contact: Contact): ContactResponse => {
  return {
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email,
    phone: contact.phone,
    id: contact.id,
  };
};

export const getSelectedContactOrThrow = async ({
  prismaService,
  username,
  contactId,
}: {
  prismaService: PrismaService;
  username: string;
  contactId: number;
}): Promise<Contact> => {
  const contact = await prismaService.contact.findFirst({
    where: {
      username,
      id: contactId,
    },
  });
  if (!contact) {
    throw new HttpException('Contact not found', HttpStatus.NOT_FOUND);
  }

  return contact;
};
