const co = require('co');
const rootRequire = require('app-root-path').require;
const {defineSupportCode} = require('cucumber');

defineSupportCode(function({Before, After}) {
  Before(function() {
    process.env.NODE_ENV = 'test';
    this.server = rootRequire('src/app');
  });

  After(function() {
    this.server.stop(co.wrap(function*() {
      yield this.knex.raw('DROP SCHEMA public CASCADE');
      yield this.knex.raw('CREATE SCHEMA public');
    }));
  });
});
