# Start Up

### Create project
```sh
composer create-project laravel/laravel crm
cd crm
composer require laravel/passport
composer require doctrine/dbal
```
### Update `.env` file and set database name
```dotenv
...
DB_DATABASE=crms
...
```
### Update users table migration
```sh
php artisan make:migration add_fields_to_users
```
and add like this
```php
public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->renameColumn('name', 'name1');
        $table->string('name2');
        $table->string('name3')->nullable();
        $table->string('phone', 30)->nullable();
    });
}

public function down()
{
    Schema::table('users', function (Blueprint $table) {
        $table->renameColumn('name1', 'name');
        $table->dropColumn(['name2', 'name3', 'phone']);
    });
}
```
then
```sh
php artisan migrate
php artisan passport:install
```
### Update `/app/Models/User.php` file
* use HasApiTokens
* modify fillable section with new fields
```php
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name1',
        'name2',
        'name3',
        'phone',
        'email',
        'password',
    ];
```

### Call the `Passport::routes` method within the `boot` method of your `/app/Providers/AuthServiceProvider.php`

```php
public function boot()
{
    $this->registerPolicies();

    if (! $this->app->routesAreCached()) {
        Passport::routes();
    }
}
```

### In `/config/auth.php` configuration file, you should set the `driver` option of the `api` authentication guard to `passport`
```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],

    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],
],
```

# Auth
### Create the controller for users authentication
```sh
php artisan make:controller api/AuthController
```
and add there two methods
```php
public function register(Request $request)
{
    $validatedData = $request->validate([
        'name' => 'required|max:55',
        'email' => 'email|required|unique:users',
        'password' => 'required|confirmed'
    ]);

    $validatedData['password'] = bcrypt($request->password);

    $user = User::create($validatedData);

    $accessToken = $user->createToken('authToken')->accessToken;

    return response([ 'user' => $user, 'access_token' => $accessToken]);
}

public function login(Request $request)
{
    $loginData = $request->validate([
        'email' => 'email|required',
        'password' => 'required'
    ]);

    if (!auth()->attempt($loginData)) {
        return response(['message' => 'Invalid Credentials']);
    }

    $accessToken = auth()->user()->createToken('authToken')->accessToken;

    return response(['user' => auth()->user(), 'access_token' => $accessToken]);

}
```
# Vue integration
### NPM packages
```sh
nmp i
npm i -D vue vue-loader vue-router vue-template-compiler vuex node-sass sass sass-loader resolve-url-loader
```
### Modify `/resources/views/welcome.blade.php`
```php
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Document</title>

</head>
<body class="">
<div id="app"></div>
<script src="{{asset("js/app.js")}}"></script>
</body>
</html>
```
### The `/resources/lang` folder can be deleted
### Remove `/resources/css/app.css` file and create `/resources/css/app.scss` file
### Modify `/webpack.mix.js` to this
```js
const mix = require('laravel-mix');

mix.js('resources/js/app.js', 'public/js')
.sass('resources/css/app.scss', 'public/css')
.vue()
``` 
### Create few directories in `/resources/js` folder
* components
* router
* store
* views
```sh
mkdir components router store views
```
### Modify `/resources/js/app.js`
```js
import Vue from 'vue'
import router from './router'

import App from "./App.vue"
import "./../css/app.scss"

require('./bootstrap')


const app = new Vue({
    router,
    render: (h) => h(App),
}).$mount("#app")
```
### Create router file `/resources/js/router/index.js` with content
```js
import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

let routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
]


const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
```
### Create file `/resources/js/App.vue` with content
```vue
<template>
    <div>
        <h1>App.vue</h1>
        <router-view />
    </div>
</template>

<script>

export default {
    name: "App",
}
</script>

<style scoped>

</style>
```
### Create file `/resources/js/views/Home.vue` with content
```vue
<template>
<h1>Home</h1>
</template>

<script>
export default {
    name: "Home"
}
</script>

<style scoped>

</style>
```


## Now you can create RESTfull app freely
```sh
git init
```

# Useful
```sh
composer dump-autoload
rm -r crm/
```
