export type ServeHandler = (file: string, flags: object, restarting: boolean) => unknown;
type Serve = (fn: ServeHandler) => unknown;
export declare const serve: Serve;
export {};
//# sourceMappingURL=serve.d.ts.map