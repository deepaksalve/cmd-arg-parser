exports = module.exports = {
  // Formatters
  SHORT_OPTION_REG: /^-[a-zA-Z]/,
  SHORT_MULTIPLE_OPTION_REG: /^-[a-zA-Z]+/,
  OPTIONS_REG: /^--([^-][a-zA-Z-]+)(?:\s([a-zA-Z-]+))?/,
  OPTIONAL_PART_REG: /(\[[a-zA-Z]+\])$/,

  // Default Values
  DEFAULT_BANNER: 'Usage: [Options]',
  DEFAULT_OPTION_TITLE: 'Available options:',
  DEFAULT_COMMON_OPTION_TITLE: 'Common options:',

  // Error Type and Message
  INVALID_SHORT_OPTION: {
    name: 'CliParserError:InvalidOptionFormat',
    message: 'Short name is in invalid format'
  },
  INVALID_LONG_OPTION: {
    name: 'CliParserError:InvalidOptionFormat',
    message: 'Long name is in invalid format'
  },
  INVALID_FLAG_OPTION: {
    name: 'CliParserError:InvalidOption',
    message: 'Coupled options must be Flag only'
  },
  INVALID_ARGUMENT_FLAG_OPTIONS: {
    name: 'CliParserError:UnnecessaryArgument',
    message: 'Unnecessary argument {{argument}} passed after flag only options {{options}}'
  },

  DUPLICATE_OPTION: {
    name: 'CliParserError:DuplicateOptions',
    message: '"{{short}}" or "{{long}}" option is already defined'
  },

  EMPTY_GROUP_TITLE: {
    name: 'CliParserError:EmptyGroupTitle',
    message: 'A group title must be a Non Empty string'
  },
  EMPTY_GROUP_OPTIONS: {
    name: 'CliParserError:EmptyGroupOptions',
    message: 'A group options must be a Non Empty array of short name'
  },

  EMPTY_MUTUALLY_EXCLUSIVE_OPTIONS: {
    name: 'CliParserError:EmptyMutualOptions',
    message: 'Options must be a array of at least two short name'
  },
  INVALID_MUTUALLY_EXCLUSIVE_OPTIONS: {
    name: 'CliParserError:InvalidMutuallyExclusiveOptions',
    message: 'Mutually exclusive options must be either Required or Flag only'
  },
  MUTUALLY_EXCLUSIVE_OPTIONS: {
    name: 'CliParserError:MutuallyExclusiveOptions',
    message: 'Options {{options}} are Mutually exclusive.'
  },

  UNKNOWN_OPTION_PASSED: {
    name: 'CliParserError:UnknownOptions',
    message: 'Unknown Option passed'
  },
  MISSING_ARGUMENT: {
    name: 'CliParserError:MissingArgument',
    message: 'Missing option argument'
  },
  MISSING_REQUIRED_OPTIONS: {
    name: 'CliParserError:MissingOptions',
    message: 'Missing required options\n {{options}}'
  },

  GENERIC_ERROR: {
    name: 'CliParserError',
    message: 'Unable to parse option.'
  }
};
