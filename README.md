# Multicolour Javascript SDK

Generate your front end JavaScript SDK for use with your Multicolour API.

This generates:

* ES6 modules/classes to consume and extend in your modern apps.
* ES5, UMD bundled app to use wherever and whenever.

It features:

* Client side validation that matches server side validation.
* Customisable namespace/module name.
* A natural API, I.E `API.person.get` and `API.person.create`, etc.
* Content negotiation so you can choose how, what & when to consume your data.

Browser support:

Latest on all browsers (more testing coming soon)

## Getting started

Same as any other Multicolour plugin, simply use

```
your_service.use(require("multicolour-javascript-sdk"))
```
### Configuration

There are two settings you can change via your `config.js`:

```
settings: {
  ...
  javascript_sdk: {
    // Where to write the SDK to.
    destination: `${__dirname}/content/frontend/build/api_sdk`,
    
    // 
    module_name: "API_SDK"
  }
  ...
}
```
