import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto/auth.dto";
import * as argon  from "argon2";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
constructor(private prisma : PrismaService, private config: ConfigService, private jwt : JwtService) {}
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
async signIn(AuthDto: AuthDto) {
    //find user
    const user = await this.prisma.user.findUnique({
        where: {
            email: AuthDto.email,
        }
    });

    // throw error if user is not found
    if(!user) throw new ForbiddenException('Credentials not matched');

    // verify password
    const matchPass = await argon.verify(user.hash, AuthDto.password);
    // throw exception if credentials not match
    if (!matchPass) throw new ForbiddenException('Credentials not matched');

    return this.signToken(user.id, user.email)
}

async signToken(userId: number, email: string): Promise<{access_token: string}>{
    const payload = {
        sub: userId,
        email: email
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
        expiresIn: '15m',
        secret
    });

    return {
        access_token: token,
    }
}
}