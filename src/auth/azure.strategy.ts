import { BearerStrategy } from 'passport-azure-ad';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class AzureStrategy extends PassportStrategy(BearerStrategy, 'azure') {
  constructor() {
    super({
      identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID || 'common'}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.AZURE_CLIENT_ID || 'falso-client-id-para-desenvolvimento-local',
    });
  }

  async validate(payload: any) {
    return { email: payload.preferred_username, name: payload.name };
  }
}