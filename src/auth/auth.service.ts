import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
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

      // SELECT Count(*) FROM user WHERE email = 'email';
      //return saved user
      return user;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
    }
  }

  signin() {
    return { msg: 'signin successful' };
  }
}
