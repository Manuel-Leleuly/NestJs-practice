import { Test, TestingModule } from '@nestjs/testing';
import * as httpMock from 'node-mocks-http';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should say hello', async () => {
    const response = await controller.sayHello('Manuel');
    expect(response).toEqual('Hello Manuel');
  });

  it('should get view', async () => {
    const response = httpMock.createResponse();
    controller.viewHello('Manuel', response);

    expect(response._getRenderView()).toBe('index.html');
    expect(response._getRenderData()).toEqual({
      name: 'Manuel',
      title: 'Template Engine',
    });
  });
});
