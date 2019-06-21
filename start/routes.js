'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

// Route.on('/').render('welcome')

Route.group('studentApi', () => {


}).prefix('api/student').namespace('Student').middleware(['auth:jwtStudent'])

Route.group('studentAuth', () => {

    Route.get('login', 'AuthController.login');
    Route.post('register', 'AuthController.register');
    Route.post('forgotPassword', 'AuthController.forgotPassword');
    Route.post('resetPassword', 'AuthControlller.resetPassword');

}).prefix('api/student').namespace('Student').middleware('guest');

Route.group('adminAuth', () => {

    Route.post('login', 'AuthController.login');

}).prefix('api/admin').namespace('Admin').middleware('guest');


Route.group('adminApi', () => {

    Route.resource('difficulties', 'DifficultyController').only(['index', 'store']);

    Route.resource('exams', 'ExamController').apiOnly()

    Route.resource('examSections', 'ExamSectionController').apiOnly()

    Route.resource('questions', 'QuestionController').apiOnly()

    Route.resource('settings', 'SettingController').only(['index', 'update'])

    Route.resource('tests', 'TestController').apiOnly()

    Route.resource('testSections', 'TestSectionController').apiOnly()

    Route.resource('users', 'UserController').apiOnly()

    Route.resource('userTests', 'UserTestController').apiOnly()

}).prefix('api/admin').namespace('Admin').middleware('auth:jwtAdmin');

