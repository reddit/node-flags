feet
====

A simple feature flagging library.

```javascript
// Import it!
import Feet from 'feet';

// Set up your experiment config!
const config = {
  rug: { shoes: false },
  table: false,
  shoes: { users: ['ajacksified'] },
};

const feet = new Feet(config);

// Add rules!
Feet.addRule('shoes', function(val) { return this.shoes === val; });
Feet.addRule('users', function(names) { return names.includes(this.username); });

// Get whatever blob of data you'll use to determine your experiment truthiness
const userData = {
  shoes: true,
  username: 'ajacksified',
};

// For ease of use, build a context-bound feet instance. (Alternatively, you
// could call `feet.on(rule, context)` instead.)
const userFeet = feet.withContext(userData);

// Build your UI with a Feet context bound to userdata!
userFeet.enabled('rug'); // false (shoes are true, but the config wants false!)
userFeet.enabled('table'); // false (it's always false!)
userFeet.enabled('shoes'); // true (my name is ajacksified!)
```

Rules and Configuration
-----------------------

feet configuration and rules are very simple:

* Define a name for your features; such as `'rug'` or `'table'` as above. These
  will be the basis if your config and your feature flags for later on.
* Define the rules upon which your feature will be on or off. Above, we implement
  a boolean check (shoes) and an array check (username).
* Check the flag - either by sending it in (`feet.enabled('feature', { data } )`) or
  by hanging on to a context-bound instance (
  `ctxfeet = feet.withContext({ data }); ctxfeet.enabled('feature')`)

You can also parse large objects to handle things such as environment variables.
To do so, you should have configuration in the format `feature_name`. `feature_`
will be stripped from the key and lowercased:

```javascript
import Feet from feet;

const config = Feet.parseConfig({
  something: 'wut',
  feature_flippers: { names: ['bob', 'jane'] }
});

// => { flippers: { names: ['bob', 'jane'] } };
```

You can supply your own function, too, and customize both key and value. In
this example, we'll expect things to start with `f_` instead of `feature_`.

```javascript
import Feet from feet;

const config = Feet.parseConfig({
  something: 'wut',
  f_flippers: { names: ['bob', 'jane'] }
}, function(key, val) {
  if (key.indexOf('f_') === -1) { return; }
  return { key: key.slice(2), val: val };
});

// => { flippers: { names: ['bob', 'jane'] } };
```
