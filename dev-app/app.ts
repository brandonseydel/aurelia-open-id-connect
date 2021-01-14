import { ICustomElementViewModel, IRouter } from "aurelia";
export class App implements ICustomElementViewModel {
  constructor(@IRouter private readonly router: IRouter) {
  }

  attached() {
    this.router.goto('login');
  }
}
