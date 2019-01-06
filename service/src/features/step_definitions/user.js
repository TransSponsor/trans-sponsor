const matchPattern = require('lodash-match-pattern');
const {Given, Then} = require('cucumber');
const {expect} = require('chai');

Given('{ordinalInt} user matches', async function(id, json) {
  const [user] = await this.knex('user_account').select().where({id});

  const userResultMatchesPattern = matchPattern(user, json);
  if (userResultMatchesPattern) { throw new Error(userResultMatchesPattern); }
});

Given('a comparison of the {ordinalInt} user', async function(id) {
  const [user] = await this.knex('user_account').select().where({id});
  this.activeUser = user;
});

Then('{ordinalInt} user has not changed', async function(id) {
  const [user] = await this.knex('user_account').select().where({id});
  expect(user).to.eql(this.activeUser);
});
