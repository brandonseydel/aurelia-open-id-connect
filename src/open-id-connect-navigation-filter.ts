import { NavigationInstruction, IRoute } from '@aurelia/router';
import { valueConverter, ValueConverterInstance } from 'aurelia';
import { User } from 'oidc-client';
import OpenIdConnectRoles from './open-id-connect-roles';

@valueConverter('openIdConnectNavigationFilter')
export default class implements ValueConverterInstance {

  public toView(navModels: IRoute[], user: User): NavigationInstruction {

    return navModels.filter((navModel) => {
      if (typeof navModel === 'string') { return true; }

      const roles = navModel.parameters['roles'] as unknown as OpenIdConnectRoles[] ?? [];
      navModel.component
      if (navModel.component && typeof navModel.component === 'object') {
        roles.push(...((navModel.component as { roles: OpenIdConnectRoles[] })?.roles as []) ?? []);
      }

      if (!roles || roles.length === 0) {
        return true;
      }

      if (roles.includes(OpenIdConnectRoles.Authenticated)) {
        return user !== null;
      }

      if (roles.includes(OpenIdConnectRoles.Anonymous)) {
        return user == null;
      }

      // only possibility left is Everyone so return true
      return true;
    });
  }
}
