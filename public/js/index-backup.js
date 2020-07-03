//
//
//
/* === Note for using parcel bundle.js ===

  1. Install package

      cmd:  npm install parcel-bundler --save-dev

  2. Set up npm in package.json file

      In "scripts": {  ,  add code as below

        "watch:js": "parcel watch ./public/js/index.js --out-dir ./public/js/ --out-file bundle.js",
        "bundle:js": "parcel watch ./public/js/index.js --out-dir ./public/js/ --out-file bundle.js"

      ( be careful here. don't type comma after last command  "parcel watch ./public/js/index.js --out-dir ./public/js/ --out-file bundle.js" )

    ### ref for output options:
       https://parceljs.org/cli.html
       https://parceljs.org/cli.html#output-directory
       https://parceljs.org/cli.html#output-filename

    ### ref:  https://github.com/parcel-bundler/parcel#parcel-cli


  3. In base.pug file , use only one script link :

  script(src='/js/bundle.js')

  4. Use CLI to create bundled file with Hot Module Replacement
  cmd:  npm run watch:js
*/
console.log("" + "\n=== Message from index.js ===" + "\n");
