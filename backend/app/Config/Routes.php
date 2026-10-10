<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');

// Users REST API. The "cors" filter adds the CORS headers and answers the
// browser's OPTIONS preflight request before it reaches a controller.
$routes->group('', ['filter' => 'cors'], static function (RouteCollection $routes): void {
    $routes->get('users', 'Users::index');
    $routes->post('users', 'Users::create');
    $routes->get('users/(:num)', 'Users::show/$1');
    $routes->put('users/(:num)', 'Users::update/$1');
    $routes->delete('users/(:num)', 'Users::delete/$1');

    // Preflight routes: the Cors filter responds to these itself.
    $routes->options('users', static function () {});
    $routes->options('users/(:any)', static function () {});
});
