const path = require('path')
const HardSourcePlugin = require('hard-source-webpack-plugin')
const htmlStandards = require('reshape-standard')
// const cssStandards = require('spike-css-standards') // custom
const jsStandards = require('babel-preset-latest')
const pageId = require('spike-page-id')

// additional postcss plugins
const lost = require('lost')
const ant = require('postcss-ant')

// data
const Records = require('spike-records')
const locals = { foo: 'bar' }

const Datadir = require('spike-records-loadDir')
const dataDir = new Datadir()
dataDir.source('data/testV')
// console.log(dataDir.get())

module.exports = {

  devtool: 'source-map',

  matchers: {
    html: '*(**/)*.sgr',
    css: '*(**/)*.css'
  },

  ignore: ['**/layout.sgr', '**/_*', '**/.*', '_cache/**', 'readme.md', '**/css_modules/**', 'data/**'],

  reshape: (ctx) => {
    locals.pageId = pageId(ctx)
    return htmlStandards({
      webpack: ctx,
      locals
    })
  },

  postcss: (ctx) => {
    // const css = cssStandards({
    //   parser: false,
    //   webpack: ctx,
    //   // path: [ path.resolve(path.join(__dirname, '/assets/css/css_modules')) ], // NOTE: wait for pull request
    //   minify: false,
    //   warnForDuplicates: true // cssnano includes autoprefixer
    // })
    const css = {
      parser: undefined,
      plugins: []
    }
    css.plugins.push(require('postcss-import')({
      root: ctx.resourcePath,
      addDependencyTo: ctx,
      path: [ path.resolve(path.join(__dirname, 'assets/css/css_modules')) ]
    }))
    css.plugins.push(require('postcss-cssnext')({
      warnForDuplicates: true
    }))
    css.plugins.push(require('rucksack-css')())
    css.plugins.push(lost())
    css.plugins.push(ant())
    // css.plugins.push(require('cssnano')())
    return css
  },

  babel: { presets: [jsStandards] },

  plugins: [
    new HardSourcePlugin({
      environmentPaths: { root: __dirname },
      recordsPath: path.join(__dirname, '_cache/records.json'),
      cacheDirectory: path.join(__dirname, '_cache/hard_source_cache')
    }),
    new Records({
      addDataTo: locals,
      // testurl: { url: 'http://api.icndb.com/jokes/random' },
      testfile: { file: './data/datafile.json' },
      testyaml: { data: dataDir.get() },
      testdata: { data: { foo: 'bar' } }
    })
  ]
}
