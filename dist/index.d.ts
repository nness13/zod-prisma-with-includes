import { z } from 'zod';

declare function with_includes(schemas: any, schemaObj: Record<any, any>, includes: Record<string, any>): z.ZodObject<Pick<any, string>, "strip", z.ZodTypeAny, {
    [x: string]: any;
}, {
    [x: string]: any;
}>;

export { with_includes };
