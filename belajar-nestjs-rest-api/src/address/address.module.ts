import { Module } from '@nestjs/common';
import { ContactModule } from 'src/contact/contact.module';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';

@Module({
  providers: [AddressService],
  controllers: [AddressController],
  imports: [ContactModule],
})
export class AddressModule {}
