import { customElement, ICustomElementViewModel, inject } from 'aurelia';
import { User } from 'oidc-client';
import OpenIdConnect from './open-id-connect';
import template from './open-id-connect-user-block.html';

@customElement({ name: 'open-id-connect-user-block', template })
@inject(OpenIdConnect)
export default class OpenIdConnectUserBlock implements ICustomElementViewModel {

  public user: User | null = null;

  public get isLoggedIn(): boolean {
    return this.user !== null && this.user !== undefined;
  }

  constructor(protected readonly openIdConnect: OpenIdConnect) { }

  public async attached(): Promise<void> {
    this.openIdConnect.addOrRemoveHandler('addUserUnloaded', () => {
      this.user = null;
    });

    this.openIdConnect.addOrRemoveHandler('addUserLoaded', async () => {
      this.user = await this.openIdConnect.getUser();
    });

    this.user = await this.openIdConnect.getUser();
  }

  public login(): void {
    this.openIdConnect.login();
  }

  public logout(): void {
    this.openIdConnect.logout();
  }
}
