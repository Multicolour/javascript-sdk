"use strict"

/*!
 * Generated by:
 * 	 Get Multicolour https://getmulticolour.com
 * 	 Multicolour JavaScript SDK
 *
 * A collection of functions that perform the request to
 * the API and validation/sanitation based on your models.
 *
 * Copyright Get Multicolour https://getmulticolour.com
 * MIT License.
 */
class API {

  static query_string(search) {
    const qs = new URLSearchParams()
    for (let key in search) qs.append(key, search[key])
    return qs
  }

  constructor() {
    // Where is our API?
    this.api_root = "http://localhost:1811"

    // The default headers.
    this.headers = {
      accept: "application/json"
    }
  }

  negotiate(content_type) {
    // Otherwise, go ahead and set it.
    delete this.headers.accept
    this.headers.accept = content_type
    return this
  }

  /**
   * Validate a payload against our schema.
   * @param  {Object} payload to validate.
   * @return {Object}
   */
  validate(payload) {
    return this.schema.validate(payload)
  }

  /**
   * Fire off a request.
   * @param  {String} url to fetch.
   * @param  {Object} options to send with the request.
   * @return {Promise} fetch promise.
   */
  fetch(url, options = {}) {
    // Get the schema name from the url.
    const write_ops = new Set(["POST", "PATCH", "PUT"])

    // Return the method.
    return new Promise((resolve, reject) => {
      // If we have a payload, validate it against the model.
      if (options.body || (options.method && write_ops.has(options.method.toUpperCase()))) {
        // Check there was a body at all.
        if (!options.body) return reject(new Error("Payload must be an object"))

        // validate it if there was.
        const validation = this.validate(options.body)

        // Check for errors and reject the promise.
        if (validation.error) {
          return reject(validation.error)
        }
        else {
          options.body = JSON.stringify(options.body)
        }
      }

      // Add the headers to the options.
      options.headers = this.headers

      // Make the request.
      return fetch(this.api_root + url, options)
        .then(resolve)
        .catch(reject)
    })
  }

  // Alias some verbs for the die-hards.
  get post() { return this.create }
  get new() { return this.create }
  get read() { return this.get }
  get search() { return this.get }
  get put() { return this.update_or_create }
  get patch() { return this.update }
  get remove() { return this.delete }

  get(search) {
    const qs = API.query_string(search)
    return this.fetch(`${this.root}?${qs}`)
  }

  create(payload) {
    return this.fetch(this.root, {
      method: "POST",
      body: payload
    })
  }

  update(search, payload) {
    const id = search.id || ""
    delete search.id
    const qs = API.query_string(search)
    return this.fetch(`${this.root}/${id}?${qs}`, {
      method: "PATCH",
      body: payload
    })
  }

  update_or_create(search, payload) {
    const id = search.id || ""
    delete search.id
    const qs = API.query_string(search)
    return this.fetch(`${this.root}/${id}?${qs}`, {
      method: "PUT",
      body: payload
    })
  }

  delete(search) {
    const id = search.id || ""
    delete search.id
    const qs = API.query_string(search)
    return this.fetch(`${this.root}/${id}?${qs}`, {
      method: "DELETE"
    })
  }
}

export default API
