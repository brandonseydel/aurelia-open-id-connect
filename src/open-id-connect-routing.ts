import { IRoute, HookTypes, Navigation } from '@aurelia/router';

import { inject, IPlatform, IRouter, ViewportInstruction } from 'aurelia';
import OpenIdConnectAuthorizeStep from './open-id-connect-authorize-step';
import OpenIdConnectConfigurationManager from './open-id-connect-configuration-manager';
import OpenIdConnectLogger from './open-id-connect-logger';
import OpenIdConnectNavigationStrategies from './open-id-connect-navigation-strategies';

@inject(IRouter, OpenIdConnectConfigurationManager, OpenIdConnectNavigationStrategies, Window, IPlatform, OpenIdConnectAuthorizeStep, OpenIdConnectLogger)
export default class OpenIdConnectRouting {

  constructor(
    @IRouter private readonly router: IRouter,
    private readonly openIdConnectConfiguration: OpenIdConnectConfigurationManager,
    private readonly openIdConnectNavigationStrategies: OpenIdConnectNavigationStrategies,
    private readonly $window: Window,
    @IPlatform private readonly platform: IPlatform,
    private readonly step: OpenIdConnectAuthorizeStep,
    private readonly logger: OpenIdConnectLogger) { }

  public configureRouter(): void {
    this.addLoginRedirectRoute();
    this.addLogoutRedirectRoute();
    this.router.addHooks([this.step]);
  }

  private addLoginRedirectRoute() {
    const loginRoute: IRoute = {
      id: 'logInRedirectCallback',
      path: this.getPath(this.openIdConnectConfiguration.redirectUri)
        .replace(this.platform.location.pathname || '/', '/'),
    };
    this.router.addRoutes([loginRoute]);

    this.router.addHook((viewportInstructions: ViewportInstruction[]) => {
      if (this.isSilentLogin()) {
        return this.openIdConnectNavigationStrategies.silentSignInCallback(this.router, viewportInstructions[0].viewport);
      } else {
        return this.openIdConnectNavigationStrategies.signInRedirectCallback(this.router, viewportInstructions[0].viewport);
      }
    }, { include: [loginRoute.path], type: HookTypes['BeforeNavigation'] })
  }

  private addLogoutRedirectRoute() {

    const logoutRoute: IRoute = {
      id: 'logOutRedirectCallback',
      path: this.getPath(this.openIdConnectConfiguration.postLogoutRedirectUri)
        .replace(this.platform.location.pathname || '/', '/'),
    };


    this.router.addRoutes([logoutRoute]);
    this.router.addHook((viewportInstructions: ViewportInstruction[]) => {
      return this.openIdConnectNavigationStrategies.signOutRedirectCallback(this.router, viewportInstructions[0].viewport);
    }, { include: [logoutRoute.path], type: HookTypes['BeforeNavigation'] })

  }

  private isSilentLogin(): boolean {
    try {
      return this.$window.self !== this.$window.top;
    } catch (e) {
      return true;
    }
  }

  private getPath(uri: string): string {
    return this.convertUriToAnchor(uri).pathname;
  }

  private convertUriToAnchor(uri: string): HTMLAnchorElement {
    const anchor: HTMLAnchorElement = document.createElement('a');
    anchor.href = uri;
    return anchor;
  }
}
