import { Test, TestingModule } from '@nestjs/testing';
import { UserPrismaRepository } from './user-prisma.repository';
import { PrismaService } from '../prisma.service';
import { User } from '../../../../core/entities/user.entity';
import { UserAttributes } from '../../../../application/interfaces/user-repository.interface';

describe('UserPrismaRepository', () => {
  let userPrismaRepository: UserPrismaRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPrismaRepository,
        {
          provide: PrismaService,
          useValue: {
            users: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    userPrismaRepository =
      module.get<UserPrismaRepository>(UserPrismaRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return a user if found', async () => {
      const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
      prismaService.users.findUnique = jest.fn().mockResolvedValue(user);

      const result = await userPrismaRepository.getById('1');
      expect(result).toEqual(new User(user.id, user.name, user.email));
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if user is not found', async () => {
      prismaService.users.findUnique = jest.fn().mockResolvedValue(null);

      const result = await userPrismaRepository.getById('1');
      expect(result).toBeNull();
      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('save', () => {
    it('should upsert a user', async () => {
      const user = new User('1', 'John Doe', 'john@example.com');
      prismaService.users.upsert = jest.fn().mockResolvedValue(null);

      await userPrismaRepository.save(user);
      expect(prismaService.users.upsert).toHaveBeenCalledWith({
        where: { id: '1' },
        update: { name: 'John Doe', email: 'john@example.com' },
        create: { id: '1', name: 'John Doe', email: 'john@example.com' },
      });
    });
  });

  describe('getTheFirstByAttribute', () => {
    it('should return a user if found', async () => {
      const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
      prismaService.users.findFirst = jest.fn().mockResolvedValue(user);

      const result = await userPrismaRepository.getTheFirstByAttribute(
        UserAttributes.EMAIL,
        'john@example.com',
      );
      expect(result).toEqual(new User(user.id, user.name, user.email));
      expect(prismaService.users.findFirst).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });

    it('should return null if user is not found', async () => {
      prismaService.users.findFirst = jest.fn().mockResolvedValue(null);

      const result = await userPrismaRepository.getTheFirstByAttribute(
        UserAttributes.EMAIL,
        'john@example.com',
      );
      expect(result).toBeNull();
      expect(prismaService.users.findFirst).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
    });
  });

  describe('create', () => {
    it('should create a user', async () => {
      const user = new User('1', 'John Doe', 'john@example.com');
      prismaService.users.create = jest.fn().mockResolvedValue(null);

      await userPrismaRepository.create(user);
      expect(prismaService.users.create).toHaveBeenCalledWith({
        data: { id: '1', name: 'John Doe', email: 'john@example.com' },
      });
    });
  });
});
