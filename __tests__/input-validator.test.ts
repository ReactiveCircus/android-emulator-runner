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
      validator.checkApiLevel('20');
    };
    expect(func).toThrowError(`Minimum API level supported is ${validator.MIN_API_LEVEL}.`);
  });

  it('Validates successfully with valid api-level', () => {
    const func1 = () => {
      validator.checkApiLevel('21');
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
