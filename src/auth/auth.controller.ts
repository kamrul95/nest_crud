
import { AuthService } from './auth.service';
import { Body, Controller, Post } from "@nestjs/common";
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService : AuthService) {}

    @Post('signUp')
    signUp(@Body() AuthDto: AuthDto) {
        console.log({AuthDto});
        return this.authService.signUp();
    }

    @Post('signIn')
    signIn() {
        return this.authService.signIn();
    }
}