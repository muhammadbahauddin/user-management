<?php

namespace App\Services\Exceptions;

use RuntimeException;

/**
 * Thrown by a service when input breaks a validation or business rule.
 * Carries field => message errors so any caller (API, CLI) can report them.
 */
final class ValidationFailedException extends RuntimeException
{
    /**
     * @param array<string, string> $errors
     */
    public function __construct(private readonly array $errors)
    {
        parent::__construct('Validation failed.');
    }

    /**
     * @return array<string, string>
     */
    public function getErrors(): array
    {
        return $this->errors;
    }
}
