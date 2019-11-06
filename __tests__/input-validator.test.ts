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

describe('abi validator tests', () => {
  it('Throws if abi is unknown', () => {
    const func = () => {
      validator.checkAbi('some-abi');
    };
    expect(func).toThrowError(`Value for input.abi 'some-abi' is unknown. Supported options: ${validator.VALID_ABIS}`);
  });

  it('Validates successfully with valid abi', () => {
    const func1 = () => {
      validator.checkAbi('x86');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkAbi('x86_64');
    };
    expect(func2).not.toThrow();
  });
});

describe('headless validator tests', () => {
  it('Throws if headless is not a boolean', () => {
    const func = () => {
      validator.checkHeadless('yes');
    };
    expect(func).toThrowError(`Input for input.headless should be either 'true' or 'false'.`);
  });

  it('Validates successfully if headless is either true or false', () => {
    const func1 = () => {
      validator.checkHeadless('true');
    };
    expect(func1).not.toThrow();

    const func2 = () => {
      validator.checkHeadless('false');
    };
    expect(func2).not.toThrow();
  });
});
