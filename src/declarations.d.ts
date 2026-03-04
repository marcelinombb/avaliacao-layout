declare module "*.hbs" {
    const template: (data?: any, options?: any) => string;
    export default template;
}

declare module "*.css" {
    const content: string;
    export default content;
}
