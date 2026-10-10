<?php

namespace Tests\Feature;

use App\Database\Seeds\UserSeeder;
use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\DatabaseTestTrait;
use CodeIgniter\Test\FeatureTestTrait;

/**
 * Integration tests for the /users API: real routes, controller, model,
 * validation and MySQL test database (no mocks).
 *
 * Before each test the test database is migrated from scratch and seeded
 * with the 12 users from UserSeeder.
 *
 * @internal
 */
final class UsersApiTest extends CIUnitTestCase
{
    use DatabaseTestTrait;
    use FeatureTestTrait;

    protected $migrate     = true;
    protected $migrateOnce = false;
    protected $refresh     = true;
    protected $namespace   = 'App';
    protected $seed        = UserSeeder::class;

    private function validUser(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Test',
            'last_name'  => 'User',
            'email'      => 'test.user@example.com',
            'gender'     => 'other',
            'telephone'  => '+57 300 000 0000',
            'age'        => 30,
        ], $overrides);
    }

    public function testListReturnsAllSeededUsers(): void
    {
        $result = $this->get('users');

        $result->assertStatus(200);
        $users = json_decode($result->getJSON(), true);
        $this->assertCount(12, $users);
        $this->assertSame('ana.garcia@example.com', $users[0]['email']);
        $this->assertIsInt($users[0]['age']);
    }

    public function testShowReturnsUserOr404(): void
    {
        $result = $this->get('users/1');
        $result->assertStatus(200);
        $result->assertJSONFragment(['id' => 1, 'first_name' => 'Ana']);

        $this->get('users/9999')->assertStatus(404);
    }

    public function testCreateReturns201AndPersistsUser(): void
    {
        $result = $this->withBodyFormat('json')->post('users', $this->validUser());

        $result->assertStatus(201);
        $result->assertJSONFragment(['email' => 'test.user@example.com']);
        $this->seeInDatabase('users', ['email' => 'test.user@example.com', 'age' => 30]);
    }

    public function testCreateWithMissingFieldsReturns422WithErrors(): void
    {
        $result = $this->withBodyFormat('json')->post('users', ['first_name' => 'Only']);

        $result->assertStatus(422);
        $errors = json_decode($result->getJSON(), true)['errors'];
        foreach (['last_name', 'email', 'gender', 'age'] as $field) {
            $this->assertArrayHasKey($field, $errors);
        }
        $this->assertArrayNotHasKey('telephone', $errors, 'telephone is optional');
    }

    public function testCreateRejectsInvalidAndDuplicateEmail(): void
    {
        $this->withBodyFormat('json')->post('users', $this->validUser(['email' => 'not-an-email']))
            ->assertStatus(422);

        // ana.garcia@example.com already exists from the seeder
        $result = $this->withBodyFormat('json')->post('users', $this->validUser(['email' => 'ana.garcia@example.com']));
        $result->assertStatus(422);
        $this->assertArrayHasKey('email', json_decode($result->getJSON(), true)['errors']);
    }

    public function testUpdateKeepsOwnEmailAndReturns200(): void
    {
        $payload = $this->validUser(['email' => 'ana.garcia@example.com', 'age' => 30]);

        $result = $this->withBodyFormat('json')->put('users/1', $payload);
        $result->assertStatus(200);
        $result->assertJSONFragment(['id' => 1, 'age' => 30]);

        $this->seeInDatabase('users', ['id' => 1, 'age' => 30]);
    }

    public function testUpdateValidatesAndHandlesMissingUser(): void
    {
        // Taking another user's email is rejected
        $this->withBodyFormat('json')->put('users/1', $this->validUser(['email' => 'carlos.rodriguez@example.com']))
            ->assertStatus(422);

        $this->withBodyFormat('json')->put('users/9999', $this->validUser())->assertStatus(404);
    }

    public function testDeleteReturns204ThenUserIsGone(): void
    {
        $this->delete('users/1')->assertStatus(204);
        $this->dontSeeInDatabase('users', ['id' => 1]);
        $this->delete('users/1')->assertStatus(404);
    }
}
