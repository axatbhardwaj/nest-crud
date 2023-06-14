import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { config } from 'process';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    //generate password hash
    const hash = await argon.hash(dto.password);
    //save the new user in the DB
    try {
      // fetch user details from db with same email
      const result = await this.prisma.user.findMany({
        where: {
          email: dto.email,
        },
      });

      if (result.length > 0) {
        console.log(result);
        throw new ConflictException('Credentials taken');
      }

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        select: {
          id: true,
          email: true,
        },
      });
      //return saved user
      return user;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
    }
  }
  async signin(dto: AuthDto) {
    //find the user by email
    //if user not found throw exception
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    console.log(user);
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }
    //compare password
    const passwordMatch = await argon.verify(user.hash, dto.password);
    if (!passwordMatch) {
      throw new ForbiddenException('Credentials incorrect');
    }
    console.log(passwordMatch);
    //if password incorrect throw exception
    return this.signToken(user.id, user.email);
  }
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: String }> {
    const data = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(data, {
      expiresIn: '1h',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
