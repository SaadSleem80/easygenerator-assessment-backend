import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

/**
 * Format validation errors into a key-value map `{ [field]: "error message" }`
 * suitable for frontend forms.
 *
 * If multiple constraints fail for a field, it prioritizes `isNotEmpty` first so
 * that "required" checks are displayed before format/regex checks.
 */
function extractErrors(
  errors: ValidationError[],
  parentProperty = '',
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const error of errors) {
    const propertyKey = parentProperty
      ? `${parentProperty}.${error.property}`
      : error.property;

    if (error.constraints) {
      const constraintKeys = Object.keys(error.constraints);
      // Prioritize 'isNotEmpty' if present, otherwise take the first triggered constraint
      const selectedKey =
        constraintKeys.find((key) => key.toLowerCase() === 'isnotempty') ??
        constraintKeys[0];

      if (selectedKey && error.constraints[selectedKey]) {
        result[propertyKey] = error.constraints[selectedKey];
      }
    }

    if (error.children && error.children.length > 0) {
      Object.assign(result, extractErrors(error.children, propertyKey));
    }
  }

  return result;
}

export function validationExceptionFactory() {
  return (errors: ValidationError[]): BadRequestException => {
    const formattedErrors = extractErrors(errors);

    return new BadRequestException({
      statusCode: 400,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  };
}

