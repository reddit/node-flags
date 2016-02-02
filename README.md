feet
====

A simple feature flagging library.

__feet__ lets you quickly switch features on or off based on a context. This is
useful to test features for specific users (such as flagging on new funtionality
in a web application by reading the response context), dark-launching code,
and a/b testing.

```javascript
// Import it!
import Feet from 'feet';

// Set up your experiment config!
const config = {
  loggedoutSearch: { loggedin: false },
  oldDesign: false,
  newListingStyle: { users: ['ajacksified'] },
};

const feature = new Feet(config);

// Add rules!
feature.addRule('loggedin', function(val) { return this.loggedin === val; });
feature.addRule('users', function(names) { return names.includes(this.username); });

// Get whatever blob of data you'll use to determine your experiment truthiness
const userData = {
  loggedin: true,
  username: 'ajacksified',
};

// For ease of use, build a context-bound feet instance. (Alternatively, you
// could call `feature.on(rule, context)` instead.)
const featureContext = feature.withContext(userData);

// Build your UI with a Feet context bound to userdata!

// false (loggedin is true, but the config wants false)
if (featureContext.enabled('loggedoutSearch')) {
  searchControl = <LoggedOutSearch />;
  console.log('show the logged out search');
}

// false (the config says it's always false)
if (featureContext.enabled('oldDesign')) {
  layout = <OldLayout />;
}

// true (the username is in the users array)
if (featureContext.enabled('newListingStyle')) {
  listing = <Listing2 />;
}

// Get the list of enabled featues:
const enabled = featureContext.allEnabled();
// => ['newListingStyle'];


// Or disabled:
const disabled = featureContext.allDisabled();
// => ['loggedoutSearch', 'oldDesign'];
```

Rules and Configuration
-----------------------

__feet__ configuration and rules are very simple:

* Define a name for your features; such as `'loggedoutSearch'` or `'oldDesign'` as above. These
  will be the basis if your config and your feature flags for later on.
* Define the rules upon which your feature will be on or off. Above, we implement
  a boolean check (shoes) and an array check (username).
* Check the flag - either by sending it in (`feature.enabled('feature', { data } )`) or
  by hanging on to a context-bound instance (
  `featureContext = feature.withContext({ data }); featureContext.enabled('feature')`)

Of note: if a rule is defined in configuration but it is not implemented, it is
assumed to be false.

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

You can also retrieve a list of all currently enabled or disabled rules for a
given context by calling `feature.allEnabled` or `feature.allDisabled`. These
can be called with a context passed in, or else will use a bound context.
