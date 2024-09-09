import { Injectable } from '@nestjs/common';
import { UserAttributes, UserRepository } from '../../../../application/interfaces/user-repository.interface';
import { User } from '../../../../core/entities/user.entity';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string): Promise<User | null> {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) return null;
    return new User(user.id, user.name, user.email);
  }

  async save(user: User): Promise<void> {
    await this.prisma.users.upsert({
      where: { id: user.id },
      update: { name: user.name, email: user.email },
      create: { id: user.id, name: user.name, email: user.email },
    });
  }

  async getTheFirstByAttribute(attribute: UserAttributes, value: string | number | Date): Promise<User> {
    const user = await this.prisma.users.findFirst({ where: { [attribute]: value } });
    if (!user) return null;
    return new User(user.id, user.name, user.email);
  }

  async create(user: User): Promise<void> {
    await this.prisma.users.create({ data: { id: user.id, name: user.name, email: user.email } });
  }
}