import { UserManagerSettings } from 'oidc-client';

export default class OpenIdConnectConfiguration {
  [key: string]: unknown;
  public loginRedirectRoute: string;
  public logoutRedirectRoute: string;
  public unauthorizedRedirectRoute: string;
  public logLevel: number;
  public userManagerSettings: UserManagerSettings;
}
