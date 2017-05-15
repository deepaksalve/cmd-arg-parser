## Table of Contents

* [Cmd-Arg-Parser](#cmd-arg-parser)
  * [Features](#features)
  * [Install](#install)
  * [API](#api)
    * [Banner](#banner)
    * [Option's Title](#optionsTitle)
    * [Option's Tail (Note at the end of the option list)](#optionsTail)
    * [Add Option](#addOption)
    * [Form Options Group](#formOptionsGroup)
    * [Make Options Mutually Exclusive](#makeOptionsMutuallyExclusive)
    * [Parse](#parse)
    * [Help](#help)
  * [Example](#example)
    * [Add/define options](#add-options)
    * [Form options group](#options-group)
    * [Make options mutually exclusive](#mutually-exclusive-options)
    * [Get Help](#get-help)
    * [Parse options](#parse-options)
    * [Update Help banner](#update-help-banner)
    * [Update Help title](#update-help-title)
    * [Update option note](#update-help-note)
  * [License](#license)

Cmd-Arg-Parser
=====

A simple command line argument parser for Node.js

It's Lightweight though provides features like arguments Grouping, Mutual Exclusion, and short option grouping.

No default option is defined, it simply parses the given set of arguments into a useful object.

## Features
* Supports short (`-o value`) and long (`-option value`) argument names.
* Supports three kind of options
  * A flag only option (`-o`)
    * A flag only option is a option whose value is `boolean` and it does not require any argument.
  * A optional option (`-o [value]`)
    * A optional option is a option which does not need to be passed always, if passed it requires a value else a default value is set to the optional option.
  * A required option (`-o value`)
    * A required option is one which always need to be passed along with the value.
* Supports option grouping. It simply makes a help section more readable by displaying grouped options in sections/groups when help is printed.
* Supports groped flag options (if `-a`, `-b`, and `c` are 3 flag options then, `-abc` can also be directly used to enable all three in once)
* Supports mutually exclusive arguments.

## Install

```
npm install cmd-arg-parser
```

## API
* banner
  * is a setter to set the help/usage section title
  * e.g. `parser.banner= 'new banner'`

* optionsTitle
  * is a setter to set the options title in help/usage section
  * e.g. `parser.optionsTitle= 'List of options'`

* optionsTail
  * is a setter to set note at the end of the options list in help/usage section
  * e.g. `parser.optionsTail= 'Note at the end of the option list'`

* addOption (shortName, longName, description, defaultValue, handler)
  * `shortName`: is a short option name (`-o`), Required
  * `longName`: is a long option name (`--option`), Required
  * `description`: is a option description (`This is option description`), Required
  * `defaultValue`: is a option value if option is optional also this can be callback function that gets executed when a option is parsed, Optional
  * `handler`: is a callback function that gets executed when a option is parsed, Optional
  * e.g. `parser.addOption('-a','--option-a','This is a options A',callback);`
* formOptionsGroup (groupTitle, groupOptionShortNameArray, groupNote)
  * `groupTitle`: is a groups title (`Group title`), Required
  * `groupOptionShortNameArray`: is a array of shortNames, Required
  * `groupNote`: is a information about the group shown in help/usage section, Optional

* makeOptionsMutuallyExclusive (optionsArray)
  * `optionsArray`: is a array of at least two shortNames, Required

* parse (options)
  * `options`: is a array of actually passed option
  * it returns a object of passed options and a list of the missing options.

* help
  * This is used to get the help/usage information, it returns a string of usage information.
  * e.g. `console.log(parser.help())`

## Example

#### Add/define options
```javascript
var CmdArgParser = require('cmd-arg-parser');
var parser = new CmdArgParser();

// Initialize options.

// A flag only option
parser.addOption('-a', '--option-a', 'This is a options A');

// A Optional option without any default value
parser.addOption('-b', '--option-b [OPTIONAL]', 'This is a options B');

// A Optional option with default value 'DEFAULT'
parser.addOption('-c', '--option-c [OPTIONAL]', 'This is a options C', 'DEFAULT');

// A Optional option with default value 'DEFAULT' and a callback function
parser.addOption('-d', '--option-d [OPTIONAL]', 'This is a options d', 'DEFAULT', function (opt, value) {
    // opt: is a camelCased option long name, e.g. optionD
    // value: is a option value
    console.log('%s : %s', opt, value);
});

// A Required option
parser.addOption('-e', '--option-e REQUIRED', 'This is a options E');

// A Required option with callback function
parser.addOption('-f', '--option-f REQUIRED', 'This is a options F', function (opt, value) {
   // opt: is a camelCased option long name, e.g. optionF
   // value: is a option value
   console.log(' %s : %s', opt, value);
});

parser.addOption('-g', '--option-g', 'This is a options G');
```

#### Form options group
```javascript
parser.formOptionsGroup('Group Title', ['-d', '-e', '-f'], 'Group note');
```

#### Make options mutually exclusive
```javascript
parser.makeOptionsMutuallyExclusive(['-a', '-g']);
```
* Note: Mutually exclusive options must be either Required or Flag only.


#### Get Help
```javascript
parser.addOption('-h', '--option-h', 'This is a help options', function () {
    console.log(parser.help());
});
```

#### Parse options
```javascript
var optionArray = ['-a', '-c', 'optionalArgValue', '-e', 'requiredOptionValue'];
var result = parser.parse(optionArray);
```

#### Update Help banner
```javascript
parser.banner = 'Usage: [OPTIONS]';
```

#### To update Help title
```javascript
parser.optionsTitle = 'new Title';
```

#### Update option note
```javascript
parser.optionsTail = 'A note that is shown at the end of the option list';
```

## License
[MIT](http://en.wikipedia.org/wiki/MIT_License)