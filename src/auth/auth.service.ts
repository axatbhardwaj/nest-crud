import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  signup() {
    return { msg: 'signup sucessful' };
  }

  signin() {
    return { msg: 'signin sucessful' };
  }
}
