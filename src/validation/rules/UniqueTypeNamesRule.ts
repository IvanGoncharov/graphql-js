import type { TypeDefinitionNode } from '../../language/ast';
import type { ASTVisitor } from '../../language/visitor';

import type { SDLValidationContext } from '../ValidationContext';

/**
 * Unique type names
 *
 * A GraphQL document is only valid if all defined types have unique names.
 */
export function UniqueTypeNamesRule(context: SDLValidationContext): ASTVisitor {
  const knownTypeNames = Object.create(null);
  const schema = context.getSchema();

  return {
    ScalarTypeDefinition: checkTypeName,
    ObjectTypeDefinition: checkTypeName,
    InterfaceTypeDefinition: checkTypeName,
    UnionTypeDefinition: checkTypeName,
    EnumTypeDefinition: checkTypeName,
    InputObjectTypeDefinition: checkTypeName,
  };

  function checkTypeName(node: TypeDefinitionNode) {
    const typeName = node.name.value;

    if (schema?.getType(typeName)) {
      context.report({
        message: `Type "${typeName}" already exists in the schema. It cannot also be defined in this type definition.`,
        nodes: node.name,
      });
      return;
    }

    if (knownTypeNames[typeName]) {
      context.report({
        message: `There can be only one type named "${typeName}".`,
        nodes: [knownTypeNames[typeName], node.name],
      });
    } else {
      knownTypeNames[typeName] = node.name;
    }

    return false;
  }
}
