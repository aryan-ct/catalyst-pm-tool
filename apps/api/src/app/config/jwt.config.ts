export const JwtConfig = {
  global: true,
  secret: process.env.JWT_SECRET || 'the-secret',
  signOptions: {
    expiresIn: '7d',
  },
} as const;
