"use strict"

import API from "../api"
import waterline_joi from "waterline-joi"

class ${schema}_API extends API {
  constructor() {
    super()

    this.root = "/${schema}"
    this.id = ${schema}
    this.schema = waterline_joi(${model})
  }
}

export default ${schema}_API
