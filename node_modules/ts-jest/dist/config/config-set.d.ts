import type { Config } from '@jest/types';
import { Logger } from 'bs-logger';
import { CompilerOptions, CustomTransformers, Diagnostic, ParsedCommandLine } from 'typescript';
import type { TTypeScript } from '../types';
import type { RawCompilerOptions } from '../tsconfig-raw';
export declare class ConfigSet {
    private readonly parentLogger?;
    readonly logger: Logger;
    readonly compilerModule: TTypeScript;
    readonly isolatedModules: boolean;
    readonly cwd: string;
    tsCacheDir: string | undefined;
    parsedTsConfig: ParsedCommandLine | Record<string, any>;
    customTransformers: CustomTransformers;
    readonly rootDir: string;
    protected _overriddenCompilerOptions: Partial<CompilerOptions>;
    constructor(jestConfig: Config.ProjectConfig | undefined, parentLogger?: Logger | undefined);
    protected _resolveTsConfig(compilerOptions?: RawCompilerOptions, resolvedConfigFile?: string): Record<string, any>;
    get tsJestDigest(): string;
    isTestFile(fileName: string): boolean;
    shouldStringifyContent(filePath: string): boolean;
    raiseDiagnostics(diagnostics: Diagnostic[], filePath?: string, logger?: Logger): void;
    shouldReportDiagnostics(filePath: string): boolean;
    resolvePath(inputPath: string, { throwIfMissing, nodeResolve }?: {
        throwIfMissing?: boolean;
        nodeResolve?: boolean;
    }): string;
}
