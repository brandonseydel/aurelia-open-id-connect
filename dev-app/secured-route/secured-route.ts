import { ICustomElementViewModel } from 'aurelia';
import { OpenIdConnectRoles } from '../../src';
import { roles } from '../../src/roles';

@roles(OpenIdConnectRoles.Anonymous)
export class SecuredRoute implements ICustomElementViewModel {
  constructor() {
    // you can inject the element or any DI in the constructor
  }
}
