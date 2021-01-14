import { SecuredRoute } from './secured-route/secured-route';
import { Login } from './login/login';
import { App } from './app';
import Aurelia, { RouterConfiguration } from 'aurelia';
import { configure } from '../src';
import oidcConfig from "./open-id-connect-configuration-auth0";


const t = new Aurelia();
t.container;

Aurelia
  .register(
    Login,
    SecuredRoute,
    configure(oidcConfig),
    RouterConfiguration
  )
  .app(App)
  .start();
