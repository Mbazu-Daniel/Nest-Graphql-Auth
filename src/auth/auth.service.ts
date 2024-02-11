import { Injectable, ForbiddenException } from '@nestjs/common';
import { SignUpInput } from './dto/signup-input';
import { UpdateAuthInput } from './dto/update-auth.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { SignInInput } from './dto/signin-input';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async signup(signUpInput: SignUpInput) {
    try {
      const hashedPassword = await bcrypt.hash(signUpInput.password, 10);

      const user = await this.prisma.user.create({
        data: {
          username: signUpInput.username,
         password: hashedPassword,
        },
      });

      const { accessToken, refreshToken } = await this.generateToken(
        user.id,
        user.username,
      );

      await this.updateRefreshToken(user.id, refreshToken);
      return { accessToken, refreshToken, user };
    } catch (error) {
      console.error(error);
    }
  }

  async signin(signInInput: SignInInput) {
    const user = await this.prisma.user.findFirst({
      where: { username: signInInput.username },
    });

    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    const passwordMatch = await bcrypt.compare(
      signInInput.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new ForbiddenException('Access Denied');
    }

    const { accessToken, refreshToken } = await this.generateToken(
      user.id,
      user.username,
    );

    await this.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, user };
  }

  findAll() {
    return 'This action returns all auth';
  }

  findOne(id: string) {
    return `This action returns a #${id} auth`;
  }

  update(id: string, updateAuthInput: UpdateAuthInput) {
    return `This action updates a #${id} auth`;
  }

  remove(id: string) {
    return `This action removes a #${id} auth`;
  }

  // helpers
  async generateToken(userId: string, username: string) {
    const accessToken = this.jwtService.sign(
      { userId, username },
      {
        expiresIn: '1d',
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      },
    );
    const refreshToken = this.jwtService.sign(
      { userId, username, accessToken },
      {
        expiresIn: '7d',
        secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      },
    );

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    try {
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.prisma.user.update({
        where: { id: userId },
        data: { hashedRefreshToken },
      });
    } catch (error) {
      console.error(error);
    }
  }
}
