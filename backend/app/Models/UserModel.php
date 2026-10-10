<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * Data access + validation for the `users` table.
 *
 * Validation lives here (not in the controller) so every caller - the API,
 * seeders, a future CLI command - gets the same rules.
 */
class UserModel extends Model
{
    protected $table         = 'users';
    protected $primaryKey    = 'id';
    protected $returnType    = 'array';
    protected $useTimestamps = true;

    // Only these columns can be written; anything else in the request is ignored
    // (protects against mass assignment, e.g. a client sending "id" or "created_at").
    protected $allowedFields = [
        'first_name',
        'last_name',
        'email',
        'gender',
        'telephone',
        'age',
    ];

    // So the JSON contains numbers, not strings ("age": 30, not "age": "30").
    protected array $casts = [
        'id'  => 'int',
        'age' => 'int',
    ];

    public const GENDERS = ['male', 'female', 'other'];

    protected $validationRules = [
        // Only present on update; needed because the email rule uses {id} as a placeholder.
        'id'         => 'permit_empty|is_natural_no_zero',
        'first_name' => 'required|string|max_length[100]',
        'last_name'  => 'required|string|max_length[100]',
        // {id} is replaced with the id being updated, so a user can keep their own email.
        'email'      => 'required|valid_email|max_length[255]|is_unique[users.email,id,{id}]',
        'gender'     => 'required|in_list[male,female,other]',
        'telephone'  => 'permit_empty|max_length[30]|regex_match[/^\+?[0-9 ()\-]{7,30}$/]',
        'age'        => 'required|is_natural_no_zero|less_than_equal_to[120]',
    ];

    protected $validationMessages = [
        'email' => [
            'is_unique'   => 'This email is already registered.',
            'valid_email' => 'Please enter a valid email address.',
        ],
        'gender' => [
            'in_list' => 'Gender must be one of: male, female, other.',
        ],
        'telephone' => [
            'regex_match' => 'Telephone may only contain digits, spaces, +, - and parentheses (7-30 characters).',
        ],
        'age' => [
            'is_natural_no_zero'  => 'Age must be a whole number greater than 0.',
            'less_than_equal_to'  => 'Age must be 120 or less.',
        ],
    ];

    // PUT replaces the whole resource, so every required field is checked on
    // update too (by default CI only validates the fields that were sent).
    protected $cleanValidationRules = false;
}
