import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import * as argon  from "argon2";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {
constructor(private prisma : PrismaService) {}
async signUp(AuthDto: AuthDto) {
    // generate hash
    const hash = await argon.hash(AuthDto.password);
    console.log(hash);
    // create user
    try {
        const user = await this.prisma.user.create({
            data: {
                email: AuthDto.email,
                hash,
            }
        });
        delete user.hash;
        return user;
    } catch (error) {
        if(error instanceof PrismaClientKnownRequestError) {
            if(error.code === 'P2002') {
                throw new ForbiddenException('Credentials already taken');
            }
        } else {
            throw error;
        }
    }
}
signIn() {
    return {msg: 'I am signed in'};
}
}