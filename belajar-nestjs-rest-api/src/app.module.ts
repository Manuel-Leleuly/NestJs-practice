import { Module } from '@nestjs/common';
import { AddressModule } from './address/address.module';
import { CommonModule } from './common/common.module';
import { ContactModule } from './contact/contact.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [CommonModule, UserModule, ContactModule, AddressModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
