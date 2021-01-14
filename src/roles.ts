import { Constructable } from 'aurelia';
import OpenIdConnectRoles from "./open-id-connect-roles";

export function roles(...roles: OpenIdConnectRoles[]): (target: Constructable) => void {
  return function (target: Constructable) {
    Object.defineProperty(target.prototype, 'roles', {
      writable: false,
      value: roles,
      enumerable: true
    });
  }
}
