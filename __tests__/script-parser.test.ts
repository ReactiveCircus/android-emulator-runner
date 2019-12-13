import * as parser from '../src/script-parser';

describe('script parser tests', () => {
  it('Scripts are trimmed', () => {
    const script = ` command \n`;
    expect(parser.parseScript(script)).toEqual(['command']);
  });

  it('Commented lines are filtered out', () => {
    const script = `
      # command1
      command2 

      # command3
      command4
      `;
    expect(parser.parseScript(script)).toEqual(['command2', 'command4']);
  });

  it('Throws if parsed scripts array is empty', () => {
    const func = () => {
      const script = `
        # command1

        # command2

      `;
      const result = parser.parseScript(script);
      console.log(`Result: ${result}`);
    };
    expect(func).toThrowError(`No valid script found.`);
  });
});
