import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';
import { IsNotEmpty, IsString } from 'class-validator';

@ObjectType()
export class SignResponse {
  @IsString()
  @Field()
  accessToken: string;

  @IsString()
  @Field()
  refreshToken: string;

  @Field(() => User)
  user: User;
}
