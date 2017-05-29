# Multicolour Javascript SDK

[![Greenkeeper badge](https://badges.greenkeeper.io/Multicolour/javascript-sdk.svg)](https://greenkeeper.io/)

Generate your front end JavaScript SDK for use with your Multicolour API.

**This generates:**

* ES6 modules/classes to consume and extend in your modern apps.
* ES5, UMD bundled app to use wherever and whenever.

**It features:**

* Fetch promise interface (does **not** come with the [Polyfill](https://github.com/github/fetch) you should conditionally load this)
* Client side validation that matches server side validation.
* Customisable namespace/module name.
* A natural API, I.E `API.person.get` and `API.person.create`, etc.
* Content negotiation so you can choose how, what & when to consume your data.

**Browser support:**

Latest on all browsers (more testing coming soon)

## Getting started

Same as any other Multicolour plugin, simply use

```
your_service.use(require("multicolour-javascript-sdk"))
```

Then client side you can import your `api.bundle.js` or individual models and run your API, e.g

```js
API.person
  .create({ name: "Get Multicolour SDK generator" })
  .then(function(response) { return response.json() })
  .then(function(person) { console.log(person) })
  .catch(my_error_handler)
```

### Configuration

There are two settings you can change via your `config.js`:

```
settings: {
  ...
  javascript_sdk: {
    // Where to write the SDK to.
    destination: `${__dirname}/content/frontend/build/api_sdk`,

    // The module name that is exported.
    module_name: "API_SDK"
  }
  ...
}
```

## Operations

All models have the same interface at the moment, all have the following methods.

All models extend the [`API` class](https://github.com/Multicolour/javascript-sdk/blob/master/templates/api.js) which gives direct access to all internals if you prefer.

### `API.negotiate(String accept)`

Set the `Accept` header for all future requests.

### `API.{schema}.get(Object search)`

Get records from the API that match the optional `search` parameters.

##### Aliases

```
API.{schema}.read({search})
API.{schema}.search({search})
```

----

### `API.{schema}.create(Object payload)`

Create a new record in the database.

##### Aliases

```
API.{schema}.new({search})
API.{schema}.post({search})
```

----

### `API.{schema}.update(Object search, Object payload)`

Update records in the database by `search` with `payload`

##### Aliases

`API.{schema}.patch(search, payload)`

----

### `API.{schema}.update_or_create(Object search, Object payload)`

Update or create records in the database by `search` with `payload`

##### Aliases

`API.{schema}.put(search, payload)`

----

### `API.{schema}.delete(Object search)`

Delete records in the database by `search`.

##### Aliases

`API.{schema}.remove(search, payload)`

## Authorisation

If you have authorisation on your API, you need to add the `Authorisation` header to the headers object in order to auth.

We have plans for implementing an authentication interface but are still deciding how best to do it.

In the short term, this need only be run once and affects all future requests on that schema in the memory of the browser.

```
const headers = API.{schema}.headers
headers.append("Authorization", "Your magic password/token")

API.{schema}
    .create({ test: "test" })
    .then(function(response) { return response.json() })
    .then(console.log.bind(console))
    .catch(console.error.bind(console))
```
