import { Command, flags } from '@oclif/command';
import { Input, OutputArgs, OutputFlags } from '@oclif/parser';
import Vonage from '@vonage/server-sdk';
import { CredentialsObject } from '@vonage/server-sdk';
import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';

interface UserConfig {
    apiKey: string,
    apiSecret: string
}


interface IClaims {
    application_id: string
    iat?: number,
    jti?: string,
    sub?: string,
    exp?: string,
    acl?: {
        paths?: {
            "/*/users/**"?: any,
            "/*/conversations/**"?: any,
            "/*/sessions/**"?: any,
            "/*/devices/**"?: any,
            "/*/image/**"?: any,
            "/*/media/**"?: any,
            "/*/applications/**"?: any,
            "/*/push/**"?: any,
            "/*/knocking/**"?: any,
            "/*/legs/**"?: any
        }
    },

}


export default abstract class BaseCommand extends Command {
    private _vonage!: any;
    protected Vonage!: any;
    protected _apiKey!: any;
    protected _apiSecret!: any
    protected _appId!: any
    protected _keyFile!: any
    protected _userConfig!: UserConfig

    protected parsedArgs?: OutputArgs<any>;
    protected parsedFlags?: OutputFlags<typeof BaseCommand.flags>;
    protected globalFlags?: OutputFlags<any>;

    // add global flags here
    static args = [];

    // add global flags here
    static flags = {
        help: flags.help({ char: 'h' }),
        apiKey: flags.string({ hidden: true, dependsOn: ['apiSecret'] }),
        apiSecret: flags.string({ hidden: true, dependsOn: ['apiKey'] }),
        appId: flags.string({ hidden: true, dependsOn: ['keyFile'] }),
        keyFile: flags.string({ hidden: true, dependsOn: ['appId'] }),
        trace: flags.boolean({ hidden: true })
    }

    get vonage() {
        if (this._vonage) return this._vonage

        let credentials: CredentialsObject = {
            apiKey: this._apiKey || '',
            apiSecret: this._apiSecret || ''
        }

        this._vonage = new Vonage(credentials, { appendToUserAgent: "vonage-cli" });

        return this._vonage
    }

    get userConfig() {
        return this._userConfig;
    }

    saveConfig(newConfig: UserConfig): void {
        writeFileSync(path.join(this.config.configDir, 'vonage.config.json'), JSON.stringify(newConfig));
        return;
    }

    async displayBalance(): Promise<any> {
        return new Promise((res, rej) => {
            this.vonage.account.checkBalance((error: any, response: any) => {
                if (error) {
                    rej(error);
                } else {
                    res(response);
                }
            });
        })
    }

    async init(): Promise<void> {
        const { args, flags } = this.parse(this.constructor as Input<typeof BaseCommand.flags>);

        this.globalFlags = { apiKey: flags.apiKey, apiSecret: flags.apiSecret, appId: flags.appId, keyFile: flags.keyFile, trace: flags.trace };
        this.parsedArgs = args;
        this.parsedFlags = flags;
        this.Vonage = Vonage;

        //this removes the global flags from the command, so checking for interactive mode is possible.
        delete this.parsedFlags.apiKey
        delete this.parsedFlags.apiSecret
        delete this.parsedFlags.trace

        let rawConfig = readFileSync(path.join(this.config.configDir, 'vonage.config.json'))

        this._userConfig = JSON.parse(rawConfig.toString());
        let apiKey, apiSecret, appId, keyFile;

        // creds priority order -- flags > env > config
        // todo - need a better interface for this
        if (flags?.apiKey && flags?.apiSecret) {
            apiKey = flags.apiKey;
            apiSecret = flags.apiSecret;
        } else if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) {
            apiKey = process.env.VONAGE_API_KEY;
            apiSecret = process.env.VONAGE_API_SECRET;
        } else {
            apiKey = this._userConfig.apiKey;
            apiSecret = this._userConfig.apiSecret;
        }

        if (flags?.appId && flags?.keyFile) {
            appId = flags.appId;
            keyFile = flags.keyFile;
        }

        this._apiKey = apiKey;
        this._apiSecret = apiSecret;
        this._appId = appId;
        this._keyFile = keyFile;
    }


    async catch(error: any) {
        if (error.oclif?.exit === 0) return;
        if (this.globalFlags?.trace) this.log(error.stack)
        if (error.statusCode === 401) {
            this.error(
                new Error('Invalid Credentials'),
                {
                    code: 'API_AUTH_ERR',
                    suggestions: [
                        'Check your config credentials are correct - vonage config',
                    ]
                }
            )
        }

        return super.catch(error);
    }

    async finally(error) {
        return super.finally(error);
    }
}