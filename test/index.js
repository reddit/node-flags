/* eslint no-unused-expressions:0 */
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import Feet from '../index.es6.js';

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

    it('returns a list of all enabled features', () => {
      const config = {
        test1: true,
        test2: true,
        test3: false,
      };

      const feet = new Feet(config);
      const enabled = feet.allEnabled();
      expect(enabled).to.deep.equal(['test1', 'test2']);
    });

    it('returns a list of all enabled features for a given context', () => {
      const config = {
        test1: { isHamster: true },
        test2: { isHamster: true },
        test3: { isHamster: false },
      };

      const rules = {
        isHamster (b) { return (this.name === 'hamster') === b; },
      };

      const context = { name: 'hamster' };

      const feet = new Feet(config, rules, context);
      const enabled = feet.allEnabled();
      expect(enabled).to.deep.equal(['test1', 'test2']);
    });

    it('returns a list of all disabled features', () => {
      const config = {
        test1: true,
        test2: true,
        test3: false,
      };

      const feet = new Feet(config);
      const enabled = feet.allDisabled();
      expect(enabled).to.deep.equal(['test3']);
    });

    it('returns a list of all disabled features for a given context', () => {
      const config = {
        test1: { isHamster: true },
        test2: { isHamster: true },
        test3: { isHamster: false },
      };

      const rules = {
        isHamster (b) { return (this.name === 'hamster') === b; },
      };

      const context = { name: 'hamster' };

      const feet = new Feet(config, rules, context);
      const enabled = feet.allDisabled();
      expect(enabled).to.deep.equal(['test3']);
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

  describe('cloning', () => {
    it('can clone itself by shallow copy of config, rules, and ctx', () => {
      const config = { test: { rule: true } };
      const rules = { rule: sinon.spy() };
      const ctx = { name: 'hamster' };

      const feet = new Feet(config, rules, ctx);
      const newfeet = feet.clone();

      expect(feet.config).to.not.equal(newfeet.config);
      expect(feet.config).to.deep.equal(newfeet.config);

      expect(feet.rules).to.not.equal(newfeet.rules);
      expect(feet.rules).to.deep.equal(newfeet.rules);

      expect(feet.ctx).to.not.equal(newfeet.ctx);
      expect(feet.ctx).to.deep.equal(newfeet.ctx);
    });
  });
});
