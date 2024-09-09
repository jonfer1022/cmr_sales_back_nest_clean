import { User } from '../../core/entities/user.entity';

export interface UserRepository {
  getById(id: string): Promise<User | null>;
  getTheFirstByAttribute(attribute: UserAttributes, value: string | number | Date): Promise<User | null>;
  create(user: User): Promise<void>;
  save(user: User): Promise<void>;
}

export enum UserAttributes {
  ID = 'id',
  NAME = 'name',
  EMAIL = 'email',
}