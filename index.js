"use strict"

// Get tools.
const fs = require("fs-extra")
const mkdirp = require("mkdirp")
const browserify = require("browserify")
const chalk = require("chalk")

class JavaScript_SDK_Generator {
  register(multicolour) {
    // Check we got an instance of Multicolour.
    if (!multicolour) {
      throw new Error("An instance of Multicolour must be passed into SDK generator.")
    }

    // Set config.
    this.config = Object.assign({
      module_name: "API",
      destination: __dirname,
      debug: multicolour.get("env") === "development",

      // This isn't necessarily going to be in the
      // javascript_sdk block so we ask Multicolour
      // for it by default.
      api_root: multicolour.request("api_root")
    }, multicolour.get("config").get("settings").javascript_sdk)

    // When the database has started, start the generation.
    multicolour.on("database_started", () => {
      /* eslint-disable */
      console.info(chalk.blue.bold("SDK: Starting SDK build"))
      /* eslint-enable*/

      // Get the models.
      this.models = multicolour.get("database").get("models")

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

      // Exit the iteration if there's nothing we can or should do.
      if (model.junctionTable || model.NO_AUTO_GEN_ROUTES) continue

      // Load the schema template file.
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

        // Write the schemas.
        fs.writeFile(`${target}/schemas/${schema}.js`, content, err => {
          if (err) throw err
          /* eslint-disable */
          console.info(chalk.blue("SDK: Wrote %s"), `${target}/schemas/${schema}.js`)
          /* eslint-enable*/
        })
      })
    }

    fs.readFile(require.resolve("./templates/api.js"), (err, content) => {
      content = content
        .toString()
        .replace(/\${api_root}/g, this.config.api_root)

      fs.writeFile(`${target}/api.js`, content, err => {
        if (err) throw err

        /* eslint-disable */
        console.info(chalk.blue("SDK: Wrote %s"), `${target}/api.js`)
        /* eslint-enable*/
      })
    })

    // Copy the package.json if people want to distribute their SDK.
    fs.copySync(require.resolve("./templates/package.json"), `${target}/package.json`)
    fs.copySync(require.resolve("./templates/LICENSE"), `${target}/LICENSE`)
    fs.copySync(require.resolve("./templates/.eslintrc.json"), `${target}/.eslintrc.json`)

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
    export_string += "module.exports = " + JSON.stringify(lib_export_object, null, 2).replace(/"/g, "")

    // Write the lib file.
    fs.writeFile(`${target}/lib.js`, export_string, err => {
      if (err) throw err
      /* eslint-disable */
      console.info(chalk.blue("SDK: Wrote %s"), `${target}/lib.js`)
      /* eslint-enable*/
    })

    // Compile the library for ES5 and UMD.
    if (!this.config.hasOwnProperty("es5") || this.config.es5 === true) {
      browserify(`${target}/lib.js`, {
        standalone: this.config.module_name,
        paths: [ __dirname + "/node_modules" ],
        debug: this.config.debug
      })
        .transform(require("babelify"), {
          global: true,
          ignore: /moment|crypto/,
          plugins: [
            require.resolve("babel-plugin-transform-es2015-block-scoping"),
            require.resolve("babel-plugin-transform-object-assign")
          ],
          presets: [ require.resolve("babel-preset-es2015") ]
        })
        .bundle()
        .pipe(fs.createWriteStream(`${target}/api.bundle.js`))
        .on("finish", () => {
          /* eslint-disable */
          console.info(chalk.blue("SDK: Wrote %s"), `${target}/api.bundle.js`)
          console.info(chalk.green.bold("SDK: Finished SDK build 🎉"))
          /* eslint-enable*/
        })
        .on("error", error => {
          /* eslint-disable */
          console.error(chalk.red.bold("SDK: SDK build failed"))
          /* eslint-enable*/
          throw error
        })
    }
  }
}

module.exports = JavaScript_SDK_Generator
