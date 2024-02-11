export type SchemaObjectType = 'integer' | 'number' | 'string' | 'boolean' | 'object' | 'null' | 'array';
export type SchemaObjectFormat = 'int32' | 'int64' | 'float' | 'double' | 'byte' | 'binary' | 'date' | 'date-time' | 'password' | string;
export interface DiscriminatorObject {
    propertyName: string;
    mapping?: {
        [key: string]: string;
    };
}
export interface ReferenceObject {
    $ref: string;
}
export interface SchemaObject {
    nullable?: boolean;
    discriminator?: DiscriminatorObject;
    readOnly?: boolean;
    writeOnly?: boolean;
    deprecated?: boolean;
    type?: SchemaObjectType | SchemaObjectType[];
    format?: SchemaObjectFormat;
    allOf?: (SchemaObject | ReferenceObject)[];
    oneOf?: (SchemaObject | ReferenceObject)[];
    anyOf?: (SchemaObject | ReferenceObject)[];
    not?: SchemaObject | ReferenceObject;
    items?: SchemaObject | ReferenceObject;
    properties?: {
        [propertyName: string]: SchemaObject | ReferenceObject;
    };
    additionalProperties?: SchemaObject | ReferenceObject | boolean;
    description?: string;
    default?: any;
    title?: string;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    enum?: any[];
}