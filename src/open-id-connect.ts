import { inject, IRouter } from 'aurelia';
import { User, UserManager, UserManagerEvents } from 'oidc-client';
import { UserManagerEventHandler, UserManagerEventsAction } from './internal-types';
import OpenIdConnectConfigurationManager from './open-id-connect-configuration-manager';
import { LoginRedirectKey } from './open-id-connect-constants';
import OpenIdConnectLogger from './open-id-connect-logger';
import OpenIdConnectRouting from './open-id-connect-routing';

@inject(OpenIdConnectRouting, IRouter, OpenIdConnectConfigurationManager, OpenIdConnectLogger, UserManager)
export default class OpenIdConnect {

  constructor(
    private readonly openIdConnectRouting: OpenIdConnectRouting,
    @IRouter private readonly router: IRouter,
    private readonly configuration: OpenIdConnectConfigurationManager,
    public readonly logger: OpenIdConnectLogger,
    public readonly userManager: UserManager) { }

  public configure(routerConfiguration: IRouter): void {

    if (typeof routerConfiguration === 'undefined' || routerConfiguration === null) {
      throw new Error('routerConfiguration parameter must not be undefined or null');
    }

    this.openIdConnectRouting.configureRouter(routerConfiguration);
  }

  public async login(args: any = {}): Promise<void> {
    if (this.router.activeRoute) {
      const loginRedirectValue = this.router.activeRoute.parameters[LoginRedirectKey];
      if (loginRedirectValue) {
        args.data = { ...args.data };
        args.data[LoginRedirectKey] = loginRedirectValue;
      }
    }

    await this.userManager.signinRedirect(args);
  }

  public async logout(args: any = {}): Promise<void> {
    try {
      await this.userManager.signoutRedirect(args);
    } catch (err) {
      if (err.message === 'no end session endpoint') {
        this.logger.debug(err);
        this.logger.debug('The user remains logged in at the authorization server.');
        this.router.load(this.configuration.logoutRedirectRoute, { replace: true });
      } else {
        throw err;
      }
    }
  }

  public loginSilent(args: any = {}): Promise<User> {
    return this.userManager.signinSilent(args);
  }

  public getUser(): Promise<User> {
    return this.userManager.getUser();
  }

  public addOrRemoveHandler(
    key: keyof UserManagerEvents,
    handler: UserManagerEventHandler): void {

    if (!key.startsWith('add') && !key.startsWith('remove')) {
      let message = 'The \'addOrRemoveHandlers\' method expects a \'key\' argument ';
      message += 'that starts with either \'add\' or \'remove\'. Instead we ';
      message += 'recevied ' + key;
      throw new TypeError(message);
    }

    const addOrRemove = this.userManager.events[key] as UserManagerEventsAction;
    addOrRemove.call(this.userManager.events, handler);
  }

  public async observeUser(callback: (user: User) => void): Promise<void> {
    this.addOrRemoveHandler('addUserLoaded', () => this.getUser().then(callback));
    this.addOrRemoveHandler('addUserUnloaded', () => this.getUser().then(callback));
    const user = await this.getUser();
    return callback(user);
  }
}
