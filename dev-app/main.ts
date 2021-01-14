import { SecuredRoute } from './secured-route/secured-route';
import { Login } from './login/login';
import { App } from './app';
import Aurelia from 'aurelia';
import { configure } from '../src';


const t = new Aurelia();
t.container;

Aurelia
  .register(
    Login,
    SecuredRoute,
    configure
  )
  .app(App)
  .start();
