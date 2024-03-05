// eslint-disable-next-line header/header
import { Type } from '../graph/type-graph';
import { Typir } from '../main';

/**
 * Typir provides a default set of Kinds, e.g. primitive types and class types.
 * For domain-specific kinds, create a new sub-class.
 */
export abstract class Kind {
    readonly $type: string;
    readonly typir: Typir;

    constructor(typir: Typir) {
        this.typir = typir;
        this.typir.registerKind(this);
    }

    getUserRepresentation(type: Type): string {
        return type.name;
    }

    // assumption: both types habe the same kind and this kind owns the called 'areAssignable' function
    abstract isAssignable(left: Type, right: Type): boolean;

    // TODO add more features
}
