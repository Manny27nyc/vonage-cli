import BaseCommand from './command';

export default abstract class AppCommand extends BaseCommand {

    static flags = {
        ...BaseCommand.flags,
        /* ... */
    };

    static args = [
        ...BaseCommand.args,
        /* ... */
    ];

    get allApplications(): any {
        return new Promise((res, rej) => {
            this.vonage.applications.get({}, (error: any, response: any) => {
                if (error) {
                    rej(error);
                }
                else {
                    res(response);
                }
            }, true);
        })
    }

    createApplication(data: object): any {
        return new Promise((res, rej) => {
            this.vonage.applications.create(data, (error: any, response: any) => {
                if (error) {
                    // console.dir(error, {depth: 5})
                    rej(error)
                } else {
                    // console.log(response)
                    res(response)
                }
            })
        })
    }

    getSingleApplication(appId: string): any {
        return new Promise((res, rej) => {
            this.vonage.applications.get(appId, (error: any, response: any) => {
                if (error) {
                    rej(error);
                }
                else {
                    res(response);
                }
            }, true);
        })
    }

    updateApplication(appId: string): any {
        return appId
    }

    deleteApplication(appId: string): any {
        return new Promise((res, rej) => {
            this.vonage.applications.delete(appId, (error: any, result: any) => {
                if (error) {
                    rej(error);
                }
                else {
                    res(result);
                }
            });
        })
    }

    updateNumber(number: string, countryCode: string, appId?: string): any {
        return new Promise((res, rej) => {
            this.vonage.number.update(
                countryCode,
                number,
                {
                    app_id: appId || null,
                },
                (error: any, result: any) => {
                    if (error) {
                        rej(error);
                    } else {
                        res(result)
                    }
                }
            );
        })
    }

    listNumbers(number?: string): any {
        return new Promise((res, rej) => {
            this.vonage.number.get(
                {
                    pattern: number || '',
                    search_pattern: 1
                },
                (error: any, result: any) => {
                    if (error) {
                        rej(error)
                    } else {
                        res(result)
                    }
                }
            )
        })
    }

}