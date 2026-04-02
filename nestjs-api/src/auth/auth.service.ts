import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService) {}

  validateToken(token: string): any {
    try {
      const secret = process.env.JWT_SECRET || 'abcAbc';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 AuthService: Validating token');
        console.log('📋 Token length:', token.length);
        console.log('🔑 Using secret:', secret);
        
        // Decode without verification first to see what we're working with
        const decodedNoVerify = jwt.decode(token, { complete: true });
        if (decodedNoVerify) {
          console.log('📊 Token Header:', decodedNoVerify.header);
          console.log('📊 Token Payload:', decodedNoVerify.payload);
        }
      }
      
      // Use jsonwebtoken library directly for verification
      const decoded = jwt.verify(token, secret) as any;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Token valid! Decoded:', {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
        });
      }
      return decoded;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Token validation FAILED:', errorMessage);
      if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        console.error('🔍 Error name:', error.name);
        console.error('🔍 Full error:', error.toString());
      }
      return null;
    }
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
