import { inject, ViewportInstruction } from 'aurelia';
import { IHookDefinition, Navigation, IRouter } from '@aurelia/router';
import { UserManager } from 'oidc-client';
import OpenIdConnectConfigurationManager from './open-id-connect-configuration-manager';
import { LoginRedirectKey } from './open-id-connect-constants';
import OpenIdConnectLogger from './open-id-connect-logger';
import OpenIdConnectRoles from './open-id-connect-roles';
import { IHookOptions } from '@aurelia/router/dist/hook-manager';

@inject(UserManager, IRouter, OpenIdConnectConfigurationManager, OpenIdConnectLogger)
export default class OpenIdConnectAuthorizeStep implements IHookDefinition {

  constructor(
    private readonly userManager: UserManager,
    @IRouter private readonly router: IRouter,
    private readonly configuration: OpenIdConnectConfigurationManager,
    private readonly logger: OpenIdConnectLogger) { }
  options: IHookOptions;

  public hook = async (viewportInstructions: ViewportInstruction[], navigation: Navigation): Promise<boolean | ViewportInstruction[]> => {

    const user = await this.userManager.getUser();

    // TODO: Make this open for extension,
    // so that user-land can configure multiple, arbitrary roles.
    if (this.requiresRole(navigation, OpenIdConnectRoles.Authenticated)) {
      if (user === null || user.expired) {
        this.logger.debug('Requires authenticated role.');

        // capture the URL to which the user was originally navigating
        // include that URL in a query string parameter on the redirect
        let loginRedirect = navigation.route.path;
        if (navigation.query && navigation.query.length) {
          loginRedirect += `?${navigation.query}`;
        }
        const loginRedirectValue = encodeURIComponent(loginRedirect);
        const queryString = `?${LoginRedirectKey}=${loginRedirectValue}`;
        const redirect = this.configuration.unauthorizedRedirectRoute + queryString;

        return [this.router.createViewportInstruction(redirect, viewportInstructions[0].viewport)];
      }
    }
    return [];
  }

  private requiresRole(
    navigation: Navigation,
    role: OpenIdConnectRoles): boolean {
    const roles = navigation.route?.parameters['roles'] as unknown as OpenIdConnectRoles[] ?? [];
    if (navigation.route?.component && typeof navigation.route?.component === 'object') {
      roles.push(...((navigation.route.component as { roles: OpenIdConnectRoles[] })?.roles as []) ?? []);
    }
    return roles.includes(role);
  }
}
