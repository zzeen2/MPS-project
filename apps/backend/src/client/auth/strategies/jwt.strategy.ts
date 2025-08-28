import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as JwtStrategyBase } from 'passport-jwt';

const fromAuthHeaderAsBearerToken: (req: any) => string | null = (req) => {
  const raw = (req?.get?.('authorization') ?? req?.headers?.authorization) as
    | string
    | string[]
    | undefined;

  const header = Array.isArray(raw) ? raw[0] : raw;
  if (!header) return null;

  const m = /^Bearer\s+(.+)$/i.exec(header);
  return m?.[1] ?? null;
};

type JwtPayload = {
  sub: string;
  grade: string;
  subscriptionStatus: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: fromAuthHeaderAsBearerToken, 
      secretOrKey: process.env.JWT_SECRET!,
      ignoreExpiration: false,
      issuer: 'mps',
      audience: 'mps-client',
    });
  }

  validate(payload: JwtPayload) {
    return { sub: payload.sub, grade: payload.grade, subscriptionStatus: payload.subscriptionStatus };
  }
}
