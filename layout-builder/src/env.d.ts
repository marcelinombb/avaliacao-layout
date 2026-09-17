declare module '*.hbs' {
  const template: string;
  export default template;
}

declare module '*?worker' {
  const workerConstructor: {
    new (): Worker
  }
  export default workerConstructor
}
