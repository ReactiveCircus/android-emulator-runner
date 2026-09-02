import { parseCmdlineToolsMajorRevision } from '../src/sdk-installer';

describe('cmdline-tools revision parser tests', () => {
  it('Parses the major revision of the cmdline-tools preinstalled on ubuntu-24.04', () => {
    const sourceProperties = ['Pkg.UserSrc=false', 'Pkg.Revision=12.0', 'Pkg.Path=cmdline-tools;12.0', 'Pkg.Desc=Android SDK Command-line Tools', ''].join('\n');
    expect(parseCmdlineToolsMajorRevision(sourceProperties)).toBe(12);
  });

  it('Parses the major revision of the cmdline-tools bundled with the action', () => {
    const sourceProperties = ['Pkg.UserSrc=false', 'Pkg.Revision=23.0', 'Pkg.Path=cmdline-tools;23.0', 'Pkg.Desc=Android SDK Command-line Tools', ''].join('\n');
    expect(parseCmdlineToolsMajorRevision(sourceProperties)).toBe(23);
  });

  it('Returns null if the revision is missing', () => {
    const sourceProperties = ['Pkg.UserSrc=false', 'Pkg.Desc=Android SDK Command-line Tools', ''].join('\n');
    expect(parseCmdlineToolsMajorRevision(sourceProperties)).toBeNull();
  });

  it('Returns null if the revision is malformed', () => {
    expect(parseCmdlineToolsMajorRevision('Pkg.Revision=unknown')).toBeNull();
  });

  it('Returns null for empty source properties', () => {
    expect(parseCmdlineToolsMajorRevision('')).toBeNull();
  });
});
