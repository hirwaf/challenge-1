import { Factory, Seeder } from 'typeorm-seeding';
import { UserEntity } from '../../app/user/entities/user.entity';

export default class CreateUserSeed implements Seeder {
  public async run(factory: Factory): Promise<any> {
    return await factory(UserEntity)().createMany(1);
  }
}
