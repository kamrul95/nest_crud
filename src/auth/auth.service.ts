import { Injectable } from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import * as argon  from "argon2";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthService {
constructor(private prisma : PrismaService) {}
async signUp(AuthDto: AuthDto) {
    // generate hash
    const hash = await argon.hash(AuthDto.password);
    console.log(hash);
    // create user
    const user = await this.prisma.user.create({
        data: {
            email: AuthDto.email,
            hash,
        }
    });
    delete user.hash;
    return user;
}
signIn() {
    return {msg: 'I am signed in'};
}
}