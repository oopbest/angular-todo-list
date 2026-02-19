// Type declarations for HTML modules
declare module '*.html' {
  const content: string;
  export default content;
}

// Angular module declaration
declare module 'angular' {
  export interface IModule {
    (name: string, requires?: string[]): IModule;
    module(name: string, requires?: string[]): IModule;
    service(name: string, serviceConstructor: any): IModule;
    component(name: string, options: any): IModule;
    directive(name: string, directiveFactory: any): IModule;
    filter(name: string, filterFactory: any): IModule;
    controller(name: string, controllerConstructor: any): IModule;
    config(configFn: any): IModule;
    run(initializationFn: any): IModule;
    constant(name: string, value: any): IModule;
    value(name: string, value: any): IModule;
    factory(name: string, serviceFactory: any): IModule;
    provider(name: string, serviceProvider: any): IModule;
    name: string;
  }
  
  export interface IAngularStatic {
    module(name: string, requires?: string[]): IModule;
  }
  
  const angular: IAngularStatic;
  export = angular;
}
