<?php

namespace App\Database\Seeds;

use App\Models\UserModel;
use CodeIgniter\Database\Seeder;

/**
 * Inserts 12 fixed sample users. Fixed (not random) data keeps the seed
 * predictable, which also makes it usable in automated tests.
 *
 * Run with: php spark db:seed UserSeeder
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['first_name' => 'Ana',      'last_name' => 'García',    'email' => 'ana.garcia@example.com',      'gender' => 'female', 'telephone' => '+57 300 123 4567', 'age' => 29],
            ['first_name' => 'Carlos',   'last_name' => 'Rodríguez', 'email' => 'carlos.rodriguez@example.com', 'gender' => 'male',   'telephone' => '+57 301 555 0101', 'age' => 41],
            ['first_name' => 'Laura',    'last_name' => 'Martínez',  'email' => 'laura.martinez@example.com',  'gender' => 'female', 'telephone' => null,               'age' => 35],
            ['first_name' => 'Daniel',   'last_name' => 'López',     'email' => 'daniel.lopez@example.com',    'gender' => 'male',   'telephone' => '+57 310 222 3344', 'age' => 23],
            ['first_name' => 'Sofía',    'last_name' => 'Hernández', 'email' => 'sofia.hernandez@example.com', 'gender' => 'female', 'telephone' => '+57 315 987 6543', 'age' => 31],
            ['first_name' => 'Andrés',   'last_name' => 'Gómez',     'email' => 'andres.gomez@example.com',    'gender' => 'male',   'telephone' => null,               'age' => 52],
            ['first_name' => 'Valentina','last_name' => 'Díaz',      'email' => 'valentina.diaz@example.com',  'gender' => 'female', 'telephone' => '+57 320 444 5566', 'age' => 27],
            ['first_name' => 'Alex',     'last_name' => 'Morales',   'email' => 'alex.morales@example.com',    'gender' => 'other',  'telephone' => '+57 311 777 8899', 'age' => 33],
            ['first_name' => 'Juan',     'last_name' => 'Pérez',     'email' => 'juan.perez@example.com',      'gender' => 'male',   'telephone' => '+57 304 111 2233', 'age' => 46],
            ['first_name' => 'Camila',   'last_name' => 'Torres',    'email' => 'camila.torres@example.com',   'gender' => 'female', 'telephone' => null,               'age' => 19],
            ['first_name' => 'Mateo',    'last_name' => 'Ramírez',   'email' => 'mateo.ramirez@example.com',   'gender' => 'male',   'telephone' => '+57 317 666 0000', 'age' => 38],
            ['first_name' => 'Isabella', 'last_name' => 'Castro',    'email' => 'isabella.castro@example.com', 'gender' => 'female', 'telephone' => '+57 312 333 4455', 'age' => 24],
        ];

        $model = new UserModel();

        foreach ($users as $user) {
            // Going through the model means seed data passes the same validation
            // as API input, and created_at/updated_at are filled in automatically.
            if ($model->insert($user) === false) {
                throw new \RuntimeException('Seeding failed for ' . $user['email'] . ': ' . implode(', ', $model->errors()));
            }
        }
    }
}
