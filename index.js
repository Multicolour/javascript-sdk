"use strict"

Error.stackTraceDepth = Infinity

const fs = require("fs-extra")
const mkdirp = require("mkdirp")
const browserify = require("browserify")

class JavaScript_SDK_Generator {
  register(multicolour) {
    multicolour.on("database_started", () => {
      // Check we got an instance of Multicolour.
      if (!multicolour) {
        throw new Error("An instance of Multicolour must be passed into SDK generator.")
      }

      // If we haven't yet scanned, do it.
      if (!multicolour.get("has_scanned")) {
        multicolour.scan()
      }

      // Get the models.
      this.models = multicolour.get("database").get("models")

      // Set config.
      this.config = Object.assign({
        destination: __dirname,
        old_ie_compatibility: false
      }, multicolour.get("config").get("settings").javascript_sdk)

      // Ensure the neccesary folders exist.
      mkdirp(this.config.destination)
      mkdirp(`${this.config.destination}/schemas`)

      // Write our schemas.
      this.write_joi_schemas()
    })
  }

  write_joi_schemas() {
    // Get the target directory.
    const target = this.config.destination

    // Loop over the models.
    for (let schema in this.models) {
      const model = this.models[schema]

      // Exit the iteration if there's nothing we can do.
      if (model.junctionTable || model.NO_AUTO_GEN_ROUTES) continue

      fs.readFile(require.resolve("./templates/schema.js"), (err, content) => {
        if (err) {
          throw err
        }

        // Create a prettified model.
        const model_text = JSON.stringify(model._attributes, " ", 2)
          .replace(/^\ {2}/mg, " ".repeat(6))
          .replace(/^\}\)/mg, "    })")

        // Stringify the file buffer.
        content = content.toString()

        // Replace the vars in the template.
        content = content.replace(/\${schema}/g, schema)
        content = content.replace(/\${model}/g, model_text)
        content = content.replace("\"waterline-joi\"", `"${__dirname}/node_modules/waterline-joi"`)

        // Write the schemas.
        fs.writeFile(`${target}/schemas/${schema}.js`, content, err => {
          if (err) {
            throw err
          }
        })
      })
    }

    // Copy the lib stuff.
    fs.copySync(require.resolve("./templates/api.js"), `${target}/api.js`)
    fs.copySync(require.resolve("./templates/package.json"), `${target}/package.json`)

    let lib_import_string = ""
    let lib_export_object = {}
    let export_string = `"use strict"\n\n`

    // Get the targets.
    const targets = Object.keys(this.models)
      .filter(model => !this.models[model].junctionTable && !this.models[model].NO_AUTO_GEN_ROUTES)

    // Create some more strings.
    targets.forEach(target => {
      lib_import_string += `import ${target}_API from "./schemas/${target}"\n`
      lib_export_object[target] = `new ${target}_API()`
    })

    export_string += lib_import_string + `\n\n`
    export_string += "export default " + JSON.stringify(lib_export_object, null, 2).replace(/"/g, "")

    // Write the lib file.
    fs.writeFile(`${target}/lib.js`, export_string, err => {
      if (err) throw err
    })

    // Compile the library.
    browserify(`${target}/lib.js`)
      .transform(require("babelify"), {
        presets: [ require.resolve("babel-preset-es2015") ],
        moduleRoot: __dirname
      })
      .bundle()
      .pipe(fs.createWriteStream(`${target}/api.bundle.js`))
  }
}

module.exports = JavaScript_SDK_Generator
