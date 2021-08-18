import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  /**
   * Get user by username
   * @param username: string
   * @return UserEntity|undefined
   */
  async getByUsername(username: string) {
    return await this.userRepo.findOne({ username });
  }

  /**
   * Get user by ID
   * @param id: string
   * @return UserEntity|undefined
   */
  async getById(id: string) {
    return await this.userRepo.findOne({ id });
  }
}
