<?php

namespace App\Controllers;

use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

/**
 * JSON REST API for users.
 *
 * The controller stays thin: read the request, call the model, map the
 * outcome to an HTTP status. Validation rules live in UserModel.
 *
 * Error responses always use the same shape so the frontend can rely on it:
 *   { "message": "...", "errors": { "field": "problem" } }
 */
class Users extends ResourceController
{
    protected $modelName = UserModel::class;
    protected $format    = 'json';

    /** @var UserModel */
    protected $model;

    /** GET /users -> 200 */
    public function index(): ResponseInterface
    {
        return $this->respond($this->model->orderBy('id', 'ASC')->findAll());
    }

    /** GET /users/{id} -> 200 | 404 */
    public function show($id = null): ResponseInterface
    {
        $user = $this->model->find($id);

        if ($user === null) {
            return $this->notFound($id);
        }

        return $this->respond($user);
    }

    /** POST /users -> 201 | 422 */
    public function create(): ResponseInterface
    {
        $data = $this->jsonBody();

        if ($data === null) {
            return $this->invalidJson();
        }

        unset($data['id']); // the database assigns ids

        $id = $this->model->insert($data);

        if ($id === false) {
            return $this->validationFailed($this->model->errors());
        }

        return $this->respondCreated($this->model->find($id));
    }

    /** PUT /users/{id} -> 200 | 422 | 404 */
    public function update($id = null): ResponseInterface
    {
        if ($this->model->find($id) === null) {
            return $this->notFound($id);
        }

        $data = $this->jsonBody();

        if ($data === null) {
            return $this->invalidJson();
        }

        // Needed by the is_unique[users.email,id,{id}] rule so a user can keep
        // their own email. "id" is not in $allowedFields, so it is never written.
        $data['id'] = (int) $id;

        if ($this->model->update($id, $data) === false) {
            return $this->validationFailed($this->model->errors());
        }

        return $this->respond($this->model->find($id));
    }

    /** DELETE /users/{id} -> 204 | 404 */
    public function delete($id = null): ResponseInterface
    {
        if ($this->model->find($id) === null) {
            return $this->notFound($id);
        }

        $this->model->delete($id);

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
