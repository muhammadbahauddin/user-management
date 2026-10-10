<?php

namespace App\Controllers;

use App\Services\Exceptions\ValidationFailedException;
use App\Services\UserService;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Psr\Log\LoggerInterface;

/**
 * JSON REST API for users.
 *
 * The controller only does HTTP: read the request, call UserService, map the
 * outcome to a status code. Business logic lives in UserService and the
 * validation rules in UserModel, so a CLI job can reuse them without HTTP.
 *
 * Error responses always use the same shape so the frontend can rely on it:
 *   { "message": "...", "errors": { "field": "problem" } }
 */
class Users extends ResourceController
{
    protected $format = 'json';

    private UserService $users;

    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        parent::initController($request, $response, $logger);

        $this->users = service('userService');
    }

    /** GET /users -> 200 */
    public function index(): ResponseInterface
    {
        return $this->respond($this->users->list());
    }

    /** GET /users/{id} -> 200 | 404 */
    public function show($id = null): ResponseInterface
    {
        $user = $this->users->find((int) $id);

        return $user === null ? $this->notFound($id) : $this->respond($user);
    }

    /** POST /users -> 201 | 422 */
    public function create(): ResponseInterface
    {
        $data = $this->jsonBody();

        if ($data === null) {
            return $this->invalidJson();
        }

        try {
            return $this->respondCreated($this->users->create($data));
        } catch (ValidationFailedException $e) {
            return $this->validationFailed($e->getErrors());
        }
    }

    /** PUT /users/{id} -> 200 | 422 | 404 */
    public function update($id = null): ResponseInterface
    {
        if ($this->users->find((int) $id) === null) {
            return $this->notFound($id);
        }

        $data = $this->jsonBody();

        if ($data === null) {
            return $this->invalidJson();
        }

        try {
            $user = $this->users->update((int) $id, $data);
        } catch (ValidationFailedException $e) {
            return $this->validationFailed($e->getErrors());
        }

        return $user === null ? $this->notFound($id) : $this->respond($user);
    }

    /** DELETE /users/{id} -> 204 | 404 */
    public function delete($id = null): ResponseInterface
    {
        if (! $this->users->delete((int) $id)) {
            return $this->notFound($id);
        }

        return $this->response->setStatusCode(204);
    }

    /**
     * Decodes the JSON request body into an array, or returns null if the
     * body is missing or not a JSON object.
     */
    private function jsonBody(): ?array
    {
        try {
            $data = $this->request->getJSON(true);
        } catch (\Throwable) {
            return null;
        }

        return is_array($data) ? $data : null;
    }

    private function notFound($id): ResponseInterface
    {
        return $this->respond(['message' => "User {$id} not found."], 404);
    }

    private function validationFailed(array $errors): ResponseInterface
    {
        return $this->respond(['message' => 'Validation failed.', 'errors' => $errors], 422);
    }

    private function invalidJson(): ResponseInterface
    {
        return $this->respond(['message' => 'Request body must be a JSON object.', 'errors' => []], 422);
    }
}
