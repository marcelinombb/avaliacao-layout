declare module "*.hbs" {
    const template: (data?: any, options?: any) => string;
    export default template;
}
