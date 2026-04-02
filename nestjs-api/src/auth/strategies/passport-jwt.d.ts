declare module 'passport-jwt' {
  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): any;
    fromExtractors(...extractors: any[]): any;
    fromBodyField(fieldName: string): any;
    fromUrlQueryParameter(paramName: string): any;
    fromHeader(header_name: string, auth_scheme: string): any;
  };
  export class Strategy {
    constructor(options: any, verify: any);
    name: string;
    authenticate(req: any, options?: any): void;
  }
}

