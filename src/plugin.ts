import { IContainer, IRegistry, IRouter, Registration } from 'aurelia';
import { UserManager } from 'oidc-client';
import { OpenIdConnectNavigationFilter, OpenIdConnectUserBlock, OpenIdConnectUserDebug } from './index-internal';
import OpenIdConnect from './open-id-connect';
import OpenIdConnectConfiguration from './open-id-connect-configuration';
import OpenIdConnectConfigurationManager from './open-id-connect-configuration-manager';
import OpenIdConnectFactory from './open-id-connect-factory';
import OpenIdConnectLogger from './open-id-connect-logger';

class OpenIdConnectPlugin implements IRegistry {

  userConfig?: OpenIdConnectConfiguration;
  factory?: OpenIdConnectFactory;



  static configure(userConfig?: OpenIdConnectConfiguration,
    factory?: OpenIdConnectFactory) {
    const openIdConnect = new OpenIdConnectPlugin();
    openIdConnect.userConfig = userConfig;
    openIdConnect.factory = factory;
    return openIdConnect;
  }

  register(container: IContainer): IContainer {

    if (!this.factory) {
      this.factory = new OpenIdConnectFactory();
    }

    container = container.register(OpenIdConnectUserBlock, OpenIdConnectUserDebug, OpenIdConnectNavigationFilter, OpenIdConnect)

    // register configuration
    const configManager = this.factory.createOpenIdConnectConfiguration(this.userConfig);
    container = container.register(Registration.instance(OpenIdConnectConfigurationManager, configManager));

    // register logger
    const openIdConnectLogger = this.factory.createOpenIdConnectLogger(configManager.logLevel);
    container = container.register(Registration.instance(OpenIdConnectLogger, openIdConnectLogger));

    // register userManager
    const userManager = this.factory.createUserManager(configManager.userManagerSettings);
    container = container.register(Registration.instance(UserManager, userManager));

    // register window
    container = container.register(Registration.instance(Window, window));

    container.get(OpenIdConnect).configure();

    return container;
  }
}

export default OpenIdConnectPlugin.configure;

