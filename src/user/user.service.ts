import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  findOne() {
    return `This action returns a  user`;
  }
}
