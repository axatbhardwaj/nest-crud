import { Injectable } from '@nestjs/common';
import { user, bookmark } from '@prisma/client';
@Injectable({})
export class AuthService {
  signup() {
    return { msg: 'signup sucessful' };
  }

  signin() {
    return { msg: 'signin sucessful' };
  }
}
