import { Field, InputType } from '@nestjs/graphql';
import {  IsNotEmpty, MinLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
@InputType()
export class SignInInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Field()
  username: string;

  @ApiProperty()
  @MinLength(6)
  @IsNotEmpty()
  @IsString()
  @Field()
  password: string;
}
