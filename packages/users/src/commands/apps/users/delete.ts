import { OutputFlags } from '@oclif/parser';
import UserCommand from '../../../users_base';
import chalk from 'chalk';

export default class UsersDelete extends UserCommand {
    static description = ""

    static examples = [
    ]

    static flags: OutputFlags<typeof UserCommand.flags> = {
        ...UserCommand.flags
    }

    static args = [
        { name: 'userID', required: false },
    ]

    async run() {
        const flags = this.parsedFlags
        const args = this.parsedArgs!;

        let response = await this.deleteUser(args.userID);

        this.log(`User ${chalk.bold(args.userID)} deleted.`)
    }
}