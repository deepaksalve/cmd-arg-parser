var constants = require('./constants.js');

var Helper = {
  /**
   * It returns true if a passed argument is Array having at least one element.
   *
   * @param {*} arr
   * @returns {*|boolean}
   */
  isNonEmptyArray: function (arr) {
    return arr && arr.constructor === Array && arr.length > 0;
  },

  /**
   * Validates passed short and long names format.
   *
   * @param {String} short A short name e.g. -a
   * @param {String} long A long name e.g. --long-name
   * @param {Function} callback A callback function
   */
  validateOptions: function (short, long, callback) {
    if (!constants.SHORT_OPTION_REG.test(short)) {
      return callback(constants.INVALID_SHORT_OPTION);
    }

    if (!constants.OPTIONS_REG.test(long)) {
      return callback(constants.INVALID_LONG_OPTION);
    }

    return callback();
  },

  /**
   * It returns true if the passed short/long name option is present in
   * passed `options` array
   *
   * @param {Object[]} options Array of options object
   * @param {String} short Option short name
   * @param {String} long Option long name
   * @returns {boolean}
   */
  isDuplicateOptions: function (options, short, long) {
    return !!options.find(function (opt) {
      return opt.short === short || opt.long === long;
    });
  },

  /**
   * It all the option parameters and forms a option object having
   * additional fields like isFlag, isRequired isOptional and value.
   *
   * @param {String} short Option short name
   * @param {String} long Option long name
   * @param {String} desc Option description
   * @param {String} def A default option value
   * @param {Function} handler A function that needs to be executed when a option is passed
   * @param {Function} callback A callback function
   */
  buildOption: function (short, long, desc, def, handler, callback) {
    var option = {
      short: short,
      long: long,
      value: undefined,
      isRequired: false,
      isOptional: false,
      isFlag: false,
      desc: desc,
      handler: handler
    };

    var match = long.match(constants.OPTIONS_REG);

    if (match) {
      if (match[2]) {
        option.desc.replace(/\.$/, '');

        if (constants.OPTIONAL_PART_REG.test(match[2])) {
          option.isOptional = true;
          option.value = def;
          option.desc += ' ["' + def + '"]';
        } else {
          option.isRequired = true;
          option.desc += ' (required)';
        }
      } else {
        option.isFlag = true;
        option.value = false;
      }
    }

    return callback(null, option);
  },

  /**
   * Finds a Option object in the list of Options
   *
   * @param {Object[]} options A array of option object
   * @param {String} option A short/long name
   * @returns {*} Returns found object if found else undefined
   */
  findOption: function (options, option) {
    if (constants.SHORT_OPTION_REG.test(option)) {
      return options.find(function (opt) {
        return opt.short === option;
      });
    }

    if (constants.OPTIONS_REG.test(option)) {
      return options.find(function (opt) {
        return opt.long === option;
      });
    }

    return undefined;
  },

  /**
   * Creates string from option metadata like short and long name and
   * description.
   *
   * @param {Object[]} options A array of options
   * @returns {Array} Array of option metadata strings
   */
  formatHelpOptions: function (options) {
    var longest = 0, rules = [], rule = '',
      spacesCount = 0, spaces = '';

    if (Helper.isNonEmptyArray(options)) {
      options.forEach(function (option) {
        if (option.long.length > longest) longest = option.long.length + 3;
      });

      options.forEach(function (option) {
        rule += '  ' + option.short;
        rule += ', ' + option.long;
        spacesCount = longest - option.long.length;

        for (var i = 0; i <= spacesCount; i++) {
          spaces += ' ';
        }

        rule += spaces + option.desc;
        rules.push(rule);

        // Reset
        rule = '';
        spaces = '';
      });
    }

    return rules;
  },

  /**
   * Converts given long option name into a camelCase string
   *
   * @param {String} option A long name string
   * @returns {String} A camelCased string of long name
   */
  formatLongOptionToCamelCase: function (option) {
    var str = option.replace(/^--/, '');

    return str.replace(/-\w/g, function (match) {
      return match.toUpperCase().replace(/-/, '');
    }).split(/\s/)[0];
  },

  /**
   * Creates a object of all passed and missing options
   *
   * @param {Object[]} options A array of option objects
   * @returns {{passedOptions: {}, missingOptions: Array}}
   */
  formattedOptionToCamelCaseWithValues: function (options) {
    var passedOptions = {}, missingOptions = [], key;

    options.forEach(function (option) {
      if (option.long) {
        if (option.isRequired && option.value === undefined) {
          missingOptions.push({
            short: option.short,
            long: option.long
          });
        } else {
          key = Helper.formatLongOptionToCamelCase(option.long);
          passedOptions[key] = option.value;
        }
      }
    });

    return {
      passedOptions: passedOptions,
      missingOptions: missingOptions
    }
  }
};

exports = module.exports = Helper;
