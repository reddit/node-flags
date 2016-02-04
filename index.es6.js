const DEFAULT_FEATURE_PARSE_PREFIX = 'feature_';

class Feet {
  // Default the context to empty, for sanity.
  ctx = {};

  // helper to make loading config easier. Take config, only load keys
  // beginning with feature_, and lowercase. The parsing function is
  // overridable.
  static parseConfig (config, parsefn=Feet.parse) {
    return Object.keys(config).reduce((o, key) => {
      const parsed = parsefn(key, config[key]);

      if (parsed) {
        o[parsed.key] = parsed.val;
      }

      return o;
    }, {});
  }

  static parse (key, val) {
    const k = key.toLowerCase();
    if (k.indexOf(DEFAULT_FEATURE_PARSE_PREFIX) === -1) { return; }

    return { key: k.slice(DEFAULT_FEATURE_PARSE_PREFIX.length), val };
  }

  // Build a new instance. In most cases, you only pass in config that sets
  // experiments up; sometimes, you may prefer to also pass rules in rather
  // than calling addRule. Passing in ctx is really only to be used internally
  // by withContext.
  constructor (featureConfig, rules={}, ctx={}) {
    this.config = featureConfig;
    this.rules = rules;
    this.ctx = ctx;
  }

  // Add a new rule
  addRule (name, fn) {
    this.rules[name] = fn;
  }

  // Check if your feet are on a thing
  enabled (name, ctx=this.ctx) {
    const config = this.config[name];

    // If there's no config for the feature we're checking for, assume false.
    if (!config) { return false; }

    // If the flag is a boolean, just return it.
    if (config === true || config === false) {
      return config;
    }

    // Otherwise, get the list of rules from the config.
    const rules = Object.keys(config);

    // Check if any of the rules fail. Use `find`, which exits as immiediately
    // as possible.
    const pass = rules.some((r) => {
      // If there's no rule, assume false.
      if (!this.rules[r]) { return false; }

      // If there is a rule, return if it failed.
      return this.rules[r].call(ctx, config[r]);
    });

    // Return whether any of the rules failed
    return pass;
  }

  // Loop through all configured features and return a string array of what
  // features _would_ return true for a given context (or are disabled if
  // enabled = false.)
  allEnabled (ctx=this.ctx, enabled=true) {
    return Object.keys(this.config).filter((configName) => {
      return this.enabled(configName, ctx) === enabled;
    });
  }

  // Loop through all configured features and return a string array of what
  // features _would not_ return true for a given context.
  allDisabled (ctx=this.ctx) {
    return this.allEnabled(ctx, false);
  }

  // Create a new, context-bound feet instance for easy calling later on.
  withContext (ctx) {
    return new Feet(this.config, this.rules, ctx);
  }
}

export default Feet;
