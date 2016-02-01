/* eslint no-unused-expressions:0 */
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import Feet from '../index';

const expect = chai.expect;
chai.use(sinonChai);

describe('Feet', () => {
  describe('constructor', () => {
    it('exists', () => {
      expect(Feet).to.not.be.undefined;
    });

    it('loads with passed-in config', () => {
      const config = { test: false };
      const feet = new Feet(config);

      expect(feet.config).to.equal(config);
    });

    it('loads with passed-in config and rules', () => {
      const config = { test: false };
      const rules = { rule () { }};

      const feet = new Feet(config, rules);

      expect(feet.rules).to.equal(rules);
    });

    it('loads with passed-in config and rules and conext', () => {
      const config = { test: { rule: true } };
      const rules = { rule: sinon.spy() };
      const ctx = { name: 'hamster' };

      const feet = new Feet(config, rules, ctx);

      expect(feet.ctx).to.equal(ctx);
      feet.enabled('test');
      expect(rules.rule.thisValues[0]).to.equal(ctx);
    });
  });

  describe('adding rules', () => {
    it('adds a rule', function() {
      const config = { test: false };
      const feet = new Feet(config);
      const rule = sinon.spy();
      feet.addRule('shoes', rule);

      expect(feet.rules.shoes).to.equal(rule);
    });
  });

  describe('checking feature', () => {
    it('returns false with no rules defined', () => {
      const config = { test: { rule: true } };
      const feet = new Feet(config);
      const enabled = feet.enabled('test');
      expect(enabled).to.be.false;
    });

    it('returns false when a context does not pass a rule', () => {
      const config = { test: { rule: true } };
      const rules = { rule () { return false; }};
      const ctx = { name: 'hamster' };

      const feet = new Feet(config, rules, ctx);

      const enabled = feet.enabled('test');
      expect(enabled).to.be.false;
    });

    it('returns true when a passes a rule', () => {
      const config = { test: { rule: true } };
      const rules = { rule () { return true; }};
      const ctx = { name: 'hamster' };

      const feet = new Feet(config, rules, ctx);

      const enabled = feet.enabled('test');
      expect(enabled).to.be.true;
    });

    it('returns true when a passes at least one rule', () => {
      const config = {
        test: {
          frule: true,
          trule: true,
        },
      };

      const rules = {
        frule () { },
        trule () { return true; },
      };

      const ctx = { name: 'hamster' };

      const feet = new Feet(config, rules, ctx);

      const enabled = feet.enabled('test');
      expect(enabled).to.be.true;
    });
  });

  describe('static helpers', () => {
    it('parses config with defaults', () => {
      const config = {
        FEATURE_THING: 1,
        FEATURE_OTHER_THING: 2,
        not_a_feature: 3,
      };

      const expectedConfig = {
        thing: 1,
        other_thing: 2,
      };

      expect(Feet.parseConfig(config)).deep.equal(expectedConfig);
    });

    it('parses config with custom fn', () => {
      const config = {
        f_thing: 1,
        f_other_thing: 2,
        not_a_feature: 3,
      };

      const expectedConfig = {
        thing: 1,
        other_thing: 2,
      };

      const customparse = function(k, v) {
        if (k.indexOf('f_') === -1) { return; }
        return { key: k.slice(2), val: v };
      };

      expect(Feet.parseConfig(config, customparse)).deep.equal(expectedConfig);
    });
  });
});
