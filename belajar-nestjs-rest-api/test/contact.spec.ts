import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Logger } from 'winston';
import { AppModule } from '../src/app.module';
import { TestModule } from './test.module';
import { TestService } from './test.service';

describe('Contact Controller', () => {
  let app: INestApplication<App>;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  describe('POST /api/contacts', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createAll();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', 'test')
        .send({
          first_name: '',
          last_name: '',
          email: 'salah',
          phone: '',
        });

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to create contact', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/contacts')
        .set('Authorization', 'test')
        .send({
          first_name: 'test',
          last_name: 'test',
          email: 'test@example.com',
          phone: '9999',
        });

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.first_name).toBe('test');
      expect(response.body.data.last_name).toBe('test');
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.phone).toBe('9999');
    });
  });

  describe('GET /api/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createAll();
    });

    it('should be rejected if contact is not found', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${contact.id + 1}`)
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get contact', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .get(`/api/contacts/${contact.id}`)
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.first_name).toBe('test');
      expect(response.body.data.last_name).toBe('test');
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.phone).toBe('9999');
    });
  });

  describe('PUT /api/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createAll();
    });

    it('should be rejected if request is invalid', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${contact.id}`)
        .set('Authorization', 'test')
        .send({
          first_name: '',
          last_name: '',
          email: 'salah',
          phone: '',
        });

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if contact is not found', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${contact.id + 1}`)
        .set('Authorization', 'test')
        .send({
          first_name: 'test',
          last_name: 'test',
          email: 'test@example.com',
          phone: '9999',
        });

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to update contact', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .put(`/api/contacts/${contact.id}`)
        .set('Authorization', 'test')
        .send({
          first_name: 'test updated',
          last_name: 'test updated',
          email: 'testupdated@example.com',
          phone: '8888',
        });

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.first_name).toBe('test updated');
      expect(response.body.data.last_name).toBe('test updated');
      expect(response.body.data.email).toBe('testupdated@example.com');
      expect(response.body.data.phone).toBe('8888');
    });
  });

  describe('DELETE /api/contacts/:contactId', () => {
    beforeEach(async () => {
      await testService.deleteAll();

      await testService.createUser();
      await testService.createContact();
    });

    it('should be rejected if contact is not found', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .delete(`/api/contacts/${contact.id + 1}`)
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to remove contact', async () => {
      const contact = await testService.getContact();
      const response = await request(app.getHttpServer())
        .delete(`/api/contacts/${contact.id}`)
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data).toBe(true);
    });
  });

  describe('GET /api/contacts', () => {
    beforeEach(async () => {
      await testService.deleteAll();
      await testService.createAll();
    });

    it('should be able to search contacts', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.length).toBe(1);
    });

    it('should be able to search contacts by name', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .set('Authorization', 'test')
        .query({
          name: 'es',
        });

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.length).toBe(1);
    });

    it('should be able to search contacts by name, not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .set('Authorization', 'test')
        .query({
          name: 'wrong',
        });

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search contacts by email', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .set('Authorization', 'test')
        .query({
          email: 'es',
        });

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.length).toBe(1);
    });

    it('should be able to search contacts by email, not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .set('Authorization', 'test')
        .query({
          email: 'wrong',
        });

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search contacts by phone', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .set('Authorization', 'test')
        .query({
          phone: '9999',
        });

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.length).toBe(1);
    });

    it('should be able to search contacts by phone, not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .set('Authorization', 'test')
        .query({
          phone: '8888',
        });

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search contacts with page', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/contacts`)
        .set('Authorization', 'test')
        .query({
          size: 1,
          page: 2,
        });

      logger.info(response.body);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.data.length).toBe(0);
      expect(response.body.paging.current_page).toBe(2);
      expect(response.body.paging.total_page).toBe(1);
      expect(response.body.paging.size).toBe(1);
    });
  });
});
