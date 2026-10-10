<?php

namespace App\Services;

use App\Models\UserModel;
use App\Services\Exceptions\ValidationFailedException;

/**
 * Use cases for users. This is where business rules go as the app grows.
 *
 * It knows nothing about HTTP: the API controller and any future caller
 * (a spark command run by cron, a queue worker) use the same methods, so
 * they all get the same rules. Validation rules themselves live in UserModel.
 *
 * Get it with service('userService') - see Config\Services.
 */
class UserService
{
    public function __construct(private readonly UserModel $users)
    {
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function list(): array
    {
        return $this->users->orderBy('id', 'ASC')->findAll();
    }

    /**
     * @return array<string, mixed>|null null when the user does not exist
     */
    public function find(int $id): ?array
    {
        return $this->users->find($id);
    }

    /**
     * @return array<string, mixed> the created user
     *
     * @throws ValidationFailedException
     */
    public function create(array $data): array
    {
        unset($data['id']); // the database assigns ids

        $id = $this->users->insert($data);

        if ($id === false) {
            throw new ValidationFailedException($this->users->errors());
        }

        return $this->users->find($id);
    }

    /**
     * @return array<string, mixed>|null the updated user, or null when it does not exist
     *
     * @throws ValidationFailedException
     */
    public function update(int $id, array $data): ?array
    {
        if ($this->users->find($id) === null) {
            return null;
        }

        // Needed by the is_unique[users.email,id,{id}] rule so a user can keep
        // their own email. "id" is not in $allowedFields, so it is never written.
        $data['id'] = $id;

        if ($this->users->update($id, $data) === false) {
            throw new ValidationFailedException($this->users->errors());
        }

        return $this->users->find($id);
    }

    /**
     * @return bool false when the user does not exist
     */
    public function delete(int $id): bool
    {
        if ($this->users->find($id) === null) {
            return false;
        }

        $this->users->delete($id);

        return true;
    }
}
