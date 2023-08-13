
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./zod-prisma-with-includes.cjs.production.min.js')
} else {
  module.exports = require('./zod-prisma-with-includes.cjs.development.js')
}
