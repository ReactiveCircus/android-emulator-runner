import * as validator from '../src/input-validator';

describe('api-level validator tests', () => {
  it('Throws if api-level is not a number', () => {
    const func = () => {
      validator.checkApiLevel('api');
    };
    expect(func).toThrowError(`Unexpected API level: 'api'.`);
  });

  it('Throws if api-level is not an integer', () => {
    const func = () => {
      validator.checkApiLevel('29.1');
    };
    expect(func).toThrowError(`Unexpected API level: '29.1'.`);
  });

  it('Throws if api-level is lower than min API supported', () => {
    const func = () => {
      validator.checkApiLevel('14');
    };
    expect(func).toThrowError(`Minimum API level supported is ${validator.MIN_API_LEVEL}.`);
  });

  it('Validates successfully with valid api-level', () => {
    const func1 = () => {
      validator.checkApiLevel('15');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkApiLevel('29');
    };
    expect(func2).not.toThrow();
  });
});

describe('target validator tests', () => {
  it('Throws if target is unknown', () => {
    const func = () => {
      validator.checkTarget('some-target');
    };
    expect(func).toThrowError(`Value for input.target 'some-target' is unknown. Supported options: ${validator.VALID_TARGETS}`);
  });

  it('Validates successfully with valid target', () => {
    const func1 = () => {
      validator.checkTarget('default');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkTarget('google_apis');
    };
    expect(func2).not.toThrow();

    const func3 = () => {
      validator.checkTarget('google_apis');
    };
    expect(func3).not.toThrow();
  });
});

describe('arch validator tests', () => {
  it('Throws if arch is unknown', () => {
    const func = () => {
      validator.checkArch('some-arch');
    };
    expect(func).toThrowError(`Value for input.arch 'some-arch' is unknown. Supported options: ${validator.VALID_ARCHS}`);
  });

  it('Validates successfully with valid arch', () => {
    const func1 = () => {
      validator.checkArch('x86');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkArch('x86_64');
    };
    expect(func2).not.toThrow();
  });
});

describe('disable-animations validator tests', () => {
  it('Throws if disable-animations is not a boolean', () => {
    const func = () => {
      validator.checkDisableAnimations('yes');
    };
    expect(func).toThrowError(`Input for input.disable-animations should be either 'true' or 'false'.`);
  });

  it('Validates successfully if disable-animations is either true or false', () => {
    const func1 = () => {
      validator.checkDisableAnimations('true');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkDisableAnimations('false');
    };
    expect(func2).not.toThrow();
  });
});

describe('disable-spellchecker validator tests', () => {
  it('Throws if disable-spellchecker is not a boolean', () => {
    const func = () => {
      validator.checkDisableSpellchecker('yes');
    };
    expect(func).toThrowError(`Input for input.disable-spellchecker should be either 'true' or 'false'.`);
  });

  it('Validates successfully if disable-spellchecker is either true or false', () => {
    const func1 = () => {
      validator.checkDisableSpellchecker('true');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkDisableSpellchecker('false');
    };
    expect(func2).not.toThrow();
  });
});

describe('disable-autofill validator tests', () => {
  it('Throws if disable-autofill is not a boolean', () => {
    const func = () => {
      validator.checkDisableAutofill('yes');
    };
    expect(func).toThrowError(`Input for input.disable-autofill should be either 'true' or 'false'.`);
  });

  it('Validates successfully if disable-autofill is either true or false', () => {
    const func1 = () => {
      validator.checkDisableAutofill('true');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkDisableAutofill('false');
    };
    expect(func2).not.toThrow();
  });
});

describe('enable-hw-keyboard validator tests', () => {
  it('Throws if enable-hw-keyboard is not a boolean', () => {
    const func = () => {
      validator.checkEnableHwKeyboard('yes');
    };
    expect(func).toThrowError(`Input for input.enable-hw-keyboard should be either 'true' or 'false'.`);
  });

  it('Validates successfully if enable-hw-keyboard is either true or false', () => {
    const func1 = () => {
      validator.checkEnableHwKeyboard('true');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkEnableHwKeyboard('false');
    };
    expect(func2).not.toThrow();
  });
});

describe('enable-logcat validator tests', () => {
  it('Throws if enable-logcat is not a boolean', () => {
    const func = () => {
      validator.checkEnableLogcat('yes');
    };
    expect(func).toThrowError(`Input for input.enable-logcat should be either 'true' or 'false'.`);
  });

  it('Validates successfully if enable-logcat is either true or false', () => {
    const func1 = () => {
      validator.checkEnableLogcat('true');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkEnableLogcat('false');
    };
    expect(func2).not.toThrow();
  });
});

describe('longpress-timeout validator tests', () => {
  it('Throws if longpress-timeout is not a number', () => {
    const func = () => {
      validator.checkLongPressTimeout('abc123');
    };
    expect(func).toThrowError(`Unexpected longpress-timeout: 'abc123'.`);
  });

  it('Throws if longpress-timeout is not an integer', () => {
    const func = () => {
      validator.checkLongPressTimeout('123.123');
    };
    expect(func).toThrowError(`Unexpected longpress-timeout: '123.123'.`);
  });

  it('Validates successfully with valid longpress-timeout', () => {
    const func = () => {
      validator.checkLongPressTimeout('6061023');
    };
    expect(func).not.toThrow();
  });
});

describe('emulator-build validator tests', () => {
  it('Throws if emulator-build is not a number', () => {
    const func = () => {
      validator.checkEmulatorBuild('abc123');
    };
    expect(func).toThrowError(`Unexpected emulator build: 'abc123'.`);
  });

  it('Throws if emulator-build is not an integer', () => {
    const func = () => {
      validator.checkEmulatorBuild('123.123');
    };
    expect(func).toThrowError(`Unexpected emulator build: '123.123'.`);
  });

  it('Validates successfully with valid emulator-build', () => {
    const func = () => {
      validator.checkEmulatorBuild('6061023');
    };
    expect(func).not.toThrow();
  });
});
