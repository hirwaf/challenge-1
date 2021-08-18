import * as Faker from 'faker';
import { define } from 'typeorm-seeding';
import { UserEntity } from '../../app/user/entities/user.entity';

define(UserEntity, (faker: typeof Faker) => {
  const gender = faker.random.number(1);
  const firstName = faker.name.firstName(gender);
  const lastName = faker.name.lastName(gender);
  const username = 'admin';
  const password = 'changeme';

  const user = new UserEntity();
  user.name = `${firstName} ${lastName}`;
  user.password = password;
  user.username = username.toString().toLowerCase();
  return user;
});
