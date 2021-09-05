import tl = require('azure-pipelines-task-lib/task');
import axios from 'axios';

async function run() {
    try {
        // Validate inputs
        const jenkinsJobUrl: string | undefined = tl.getInput('jenkinsJobUrl', true);
        if (!jenkinsJobUrl) {
            tl.setResult(tl.TaskResult.Failed, 'Jenkins Job URL is required input');
            return;
        }

        const jenkinsUsername: string | undefined = tl.getInput('jenkinsUsername', true);
        if (!jenkinsUsername) {
            tl.setResult(tl.TaskResult.Failed, 'Jenkins Username');
            return;
        }

        const jenkinsApiToken: string | undefined = tl.getInput('jenkinsApiToken', true);
        if (!jenkinsApiToken) {
            tl.setResult(tl.TaskResult.Failed, 'Jenkins API Token');
            return;
        }

        const authenticationToken: string | undefined = tl.getInput('authenticationToken', true);
        if (!authenticationToken) {
            tl.setResult(tl.TaskResult.Failed, 'Authentication Token is required input');
            return;
        }

        const parameters: string | undefined = tl.getInput('parameters', false);

        const url = `${jenkinsJobUrl}${parameters ? '/buildWithParameters' : '/build'}?token=${authenticationToken}${parameters ? "&" + parameters : ""}`
        console.log(`Triggering '${jenkinsJobUrl}'`);
        const credentials = Buffer.from(`${jenkinsUsername}:${jenkinsApiToken}`).toString('base64');
        axios.get(url, {
            headers: {
                'User-Agent': 'Trigger Jenkins Job Azure DevOps Task v1.0.0',
                'Authorization': `Basic ${credentials}`,
            }
        }).then(response => {
            if (response.status !== 201) {
                tl.setResult(tl.TaskResult.Failed, `Cannot trigger job ${jenkinsJobUrl}: ${response.data.message}`);
            } else {
                tl.setResult(tl.TaskResult.Succeeded, `Successfully triggered a Jenkins job ${jenkinsJobUrl}`);
            }
        }).catch(error => {
            console.log(error);
            tl.setResult(tl.TaskResult.Failed, error.response.data.error);
        });
    }
    catch (err) {
        if (err instanceof Error) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        } else {
            tl.setResult(tl.TaskResult.Failed, 'Failed to trigger job');
        }
    }
}

run();
