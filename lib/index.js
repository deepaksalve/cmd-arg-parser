var constants = require('./constants.js');
var utils = require('./utils.js');

function _executeHandler(opt, context) {
  var _k;
  // Execute the handler function passed along with the option.
  // Pass the long option and option value as a parameters
  // to the function.
  if (opt && typeof opt.handler === 'function') {
    _k = utils.formatLongOptionToCamelCase(opt.long);
    opt.handler.apply(context, [_k, opt.value]);
  }
}

function _testMutualExclusion(opt, context) {
  if (opt && context) {
    if (context.mutuallyExclusiveOptions.length > 0 && (opt.isRequired || opt.isFlag)) {
      context.mutuallyExclusiveOptions.forEach(function (_mOpt) {
        var _contains = utils.isNonEmptyArray(_mOpt) && _mOpt.find(function (_m) {
            return (_m.short === opt.short || _m.long === opt.long);
          });

        _contains && _mOpt.forEach(function (_mo) {
          var _oo = utils.findOption(context.options, _mo.short), _msgArgs, _msg;
          if (_oo && _oo.value) {
            // If the current parsing option belongs to a `X` mutual option
            // group and a other option from the same group is already parsed,
            // then show the error and halt the current execution.
            if (!(_mo.short === opt.short || _mo.long === opt.long)) {
              _msgArgs = _mOpt.map(function (_o) {
                return _o.short
              }).join(', ');
              _msg = constants.MUTUALLY_EXCLUSIVE_OPTIONS.message.replace('{{options}}', _msgArgs);
              return context.throwError(constants.MUTUALLY_EXCLUSIVE_OPTIONS.name, _msg);
            }
          }
        });
      });
    }
  }
}

function _enableCoupledFlags(flags, context) {
  var _flagOpt;
  if (flags && context) {
    flags.replace(/^-/, '').split('').forEach(function (_flag) {
      _flagOpt = utils.findOption(context.options, '-' + _flag);

      if (!_flagOpt) {
        return context.throwError(constants.UNKNOWN_OPTION_PASSED);
      }

      if (!_flagOpt.isFlag) {
        return context.throwError(constants.INVALID_FLAG_OPTION);
      }

      _testMutualExclusion(_flagOpt, context);

      _flagOpt.value = true;

      _executeHandler(_flagOpt, context);
    });
  }
}

function _setOptionValue(opt, options, context) {
  var _arg;
  if (opt && options && context) {
    if (opt.isRequired) {
      _arg = options.shift();
      if (!_arg || utils.findOption(context.options, _arg)) {
        return context.throwError(constants.MISSING_ARGUMENT);
      }

      opt.value = _arg;
    } else if (opt.isOptional) {
      _arg = options.shift();
      if (_arg) {
        if (utils.findOption(context.options, _arg)) {
          options.unshift(_arg);
        } else {
          opt.value = _arg;
        }
      }
    } else if (opt.isFlag) {
      _arg = options.shift();
      if (!_arg) {
        opt.value = true;
      }

      if (utils.findOption(context.options, _arg)) {
        opt.value = true;
        options.unshift(_arg);
      }
    }
  }
}

function _validateMissingRequiredOptions(missingOptions, context) {
  var _mOpt, _message;
  if (utils.isNonEmptyArray(missingOptions)) {
    _mOpt = missingOptions.map(function (_o) {
      return _o && _o.short;
    }).join(', ');

    _message = constants.MISSING_REQUIRED_OPTIONS.message.replace('{{options}}', _mOpt);

    return context.throwError(constants.MISSING_REQUIRED_OPTIONS.name, _message);
  }
}

/**
 * Create a `CmdArgParser`.
 * It initializes all the variables with default values.
 *
 * The `banner`, `optionsTitle` and `optionTail` is used in
 * the help section and can be overridden.
 */
function CmdArgParser() {
  this.banner = constants.DEFAULT_BANNER;
  this.optionsTitle = constants.DEFAULT_OPTION_TITLE;
  this.optionsTail = undefined;
  this.options = [];

  this.groupedOptions = [];

  this.mutuallyExclusiveOptions = [];
}

/**
 * Function to define command line options.
 *
 * @param {String} short A short is short version of a command line option, Required
 * @param {String} long A long is long version of a command line option, Required
 * @param {String} desc A option description, Required
 * @param {String} def A Default value for the optional option, Optional
 * @param {Function} handler A callback function execute a given option is passed, Optional
 */
CmdArgParser.prototype.addOption = function (short, long, desc, def, handler) {
  var _this = this, _msg;

  utils.validateOptions(short, long, function (err) {
    if (err) {
      return _this.throwError(err);
    }

    // Check whether the `short` and/or `long` is already added to
    // the option list or not.
    // If it is already there in the list, then throw error.
    if (utils.isDuplicateOptions(_this.options, short, long)) {
      _msg = constants.DUPLICATE_OPTION.message.replace('{{short}}', short).replace('{{long}}', long);
      return _this.throwError(constants.DUPLICATE_OPTION.name, _msg);
    }

    if (typeof def === 'function') {
      handler = def;
      def = undefined;
    }

    utils.buildOption(short, long, desc, def, handler, function (err, option) {
      if (err) {
        return _this.throwError(constants.GENERIC_ERROR);
      }

      _this.options.push(option);
    });
  });
};

/**
 * It is used to make the group of added options.
 *
 * @param {String} title A group title
 * @param {String[]} options A list of option in a group
 * @param {String} tail A note/message shown after all the group options
 */
CmdArgParser.prototype.formOptionsGroup = function (title, options, tail) {
  var _this = this, _groupOpts = [], _opt;

  if (!(title && /\w+/.test(title))) {
    return _this.throwError(constants.EMPTY_GROUP_TITLE);
  }

  if (!utils.isNonEmptyArray(options)) {
    return _this.throwError(constants.EMPTY_GROUP_OPTIONS);
  }

  options.forEach(function (option) {
    if (!constants.SHORT_OPTION_REG.test(option)) {
      return _this.throwError(constants.INVALID_SHORT_OPTION);
    }

    _opt = utils.findOption(_this.options, option);

    if (!_opt) {
      return _this.throwError(constants.INVALID_SHORT_OPTION);
    }

    _groupOpts.push(_opt);
  });

  if (_groupOpts.length) {
    this.groupedOptions.push({
      title: title,
      options: _groupOpts,
      tail: tail || ''
    });
  }
};

/**
 * It is used make two or more command line options Mutually Exclusive.
 *
 * @param {String[]} options A array of options
 */
CmdArgParser.prototype.makeOptionsMutuallyExclusive = function (options) {
  var _this = this, _mutualOptions = [], _opt;
  if (!(utils.isNonEmptyArray(options) && options.length > 1)) {
    return _this.throwError(constants.EMPTY_MUTUALLY_EXCLUSIVE_OPTIONS);
  }

  options.forEach(function (option) {
    if (!constants.SHORT_OPTION_REG.test(option)) {
      return _this.throwError(constants.INVALID_SHORT_OPTION);
    }

    _opt = utils.findOption(_this.options, option);

    if (!_opt) {
      return _this.throwError(constants.INVALID_SHORT_OPTION);
    }

    if (!(_opt.isRequired || _opt.isFlag)) {
      return _this.throwError(constants.INVALID_MUTUALLY_EXCLUSIVE_OPTIONS);
    }

    _mutualOptions.push({
      short: _opt.short,
      long: _opt.long,
      isRequired: _opt.isRequired
    });
  });

  if (_mutualOptions.length) {
    this.mutuallyExclusiveOptions.push(_mutualOptions);
  }
};

/**
 * This function takes a list of options and parses the list with the
 * list of added options.
 *
 * If all the passed options are successfully parsed then it returns a object
 * of Passed and Missing option list.
 *
 * @param {String[]} options A list of command line options
 * @returns {Object} A object of parsed and missing options list
 */
CmdArgParser.prototype.parse = function (options) {
  var _this = this, _option, _opt, _arg, _result;

  options = options || process.argv.slice(2);

  if (!options) {
    this.help();
    return false;
  }

  while (_option = options.shift()) {
    _opt = utils.findOption(_this.options, _option);

    if (_opt) {
      _setOptionValue(_opt, options, _this);
      _testMutualExclusion(_opt, _this);
      _executeHandler(_opt, _this);
    } else if (constants.SHORT_MULTIPLE_OPTION_REG.test(_option)) {
      _arg = options.shift();

      if (!_arg || utils.findOption(_this.options, _arg)) {
        options.unshift(_arg);

        _enableCoupledFlags(_option, _this);
      } else {
        var _msg = constants.INVALID_ARGUMENT_FLAG_OPTIONS.message
          .replace('{{argument}}', _arg)
          .replace('{{options}}', _option);
        return _this.throwError(constants.INVALID_ARGUMENT_FLAG_OPTIONS.name, _msg);
      }
    } else {
      return _this.throwError(constants.UNKNOWN_OPTION_PASSED);
    }
  }

  _result = utils.formattedOptionToCamelCaseWithValues(_this.options);

  // Throw error if a any required option is not passed.
  _validateMissingRequiredOptions(_result.missingOptions, _this);

  return _result;
};

/**
 * To show the help
 *
 * @returns {string}
 */
CmdArgParser.prototype.help = function () {
  var _this = this, _lines = [], _commonOpt = [].concat(this.options);

  if (_this.mutuallyExclusiveOptions.length > 0) {
    _this.mutuallyExclusiveOptions.forEach(function (_mOpt) {
      _this.banner += ' [' + _mOpt.map(function (_o) {
          return _o.short
        }).join('|') + ']';
    });
  }

  if (_this.groupedOptions.length > 0) {
    _this.groupedOptions.forEach(function (_group) {
      _group.options.forEach(function (_go) {
        var _index = _commonOpt.findIndex(function (_co) {
          return _co.short === _go.short;
        });

        if (_index > -1) _commonOpt.splice(_index, 1);
      });
    });

    if (_commonOpt.length > 0) {
      _this.optionsTitle = constants.DEFAULT_COMMON_OPTION_TITLE;
    }
  }

  _lines = [].concat(_this.banner, _this.optionsTitle, utils.formatHelpOptions(_commonOpt));

  if (_this.groupedOptions.length > 0) {
    _this.groupedOptions.forEach(function (_group) {
      _lines = _lines.concat(_group.title);
      _lines = _lines.concat(utils.formatHelpOptions(_group.options));
      if (_group.tail) _lines = _lines.concat(_group.tail);
    });
  }

  if (_this.optionsTail) _lines = _lines.concat(_this.optionsTail);

  return _lines.join('\n');
};

/**
 * It throws the custom error occurred in Parsing functionality.
 */
CmdArgParser.prototype.throwError = function (name, message) {
  if (!message) {
    name = name.name;
    message = name.message;
  }

  throw {
    name: name || constants.GENERIC_ERROR.name,
    message: message || constants.GENERIC_ERROR.message
  };
};

/**
 * Expose `CmdArgParser()`.
 */
exports = module.exports = CmdArgParser;
