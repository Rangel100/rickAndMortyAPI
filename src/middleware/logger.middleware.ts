import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log('Request URL:', req.originalUrl);
        console.log('Request Method:', req.method);
        console.log('Request Headers:', req.headers);
        console.log('Request Body:', req.body);

        console.log('Response status', res.statusCode);
        next();
    }
}
