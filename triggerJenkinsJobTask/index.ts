import tl = require('azure-pipelines-task-lib/task');
import axios from 'axios';

interface JobStatus {
    currentNumber: number | undefined
    inProgress: boolean | undefined
    result: string | undefined
}

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

        let waitForJenkinsResponse: boolean = true;
        const waitForJenkinsResponseString: string | undefined = tl.getInput('waitForResponse', false);
        if (waitForJenkinsResponseString) {
            waitForJenkinsResponse = waitForJenkinsResponseString.toLowerCase() === 'true';
        }

        let waitTimeout: number = -1;
        const waitTimeoutString: string | undefined = tl.getInput('waitTimeout', false);
        if (waitTimeoutString) {
            waitTimeout = +waitTimeoutString;
        }

        const parameters: string | undefined = tl.getInput('parameters', false);

        const url = `${jenkinsJobUrl}${parameters ? '/buildWithParameters' : '/build'}?token=${authenticationToken}${parameters ? "&" + parameters : ""}`
        console.log(`Triggering '${jenkinsJobUrl}'`);
        const credentials = Buffer.from(`${jenkinsUsername}:${jenkinsApiToken}`).toString('base64');
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Trigger Jenkins Job Azure DevOps Task v1.0.0',
                    'Authorization': `Basic ${credentials}`,
                }
            });
            if (response.status !== 201) {
                tl.setResult(tl.TaskResult.Failed, `Cannot trigger job ${jenkinsJobUrl}: ${response.data.message}`);
            } else {
                if (!waitForJenkinsResponse) {
                    tl.setResult(tl.TaskResult.Succeeded, `Successfully triggered a Jenkins job ${jenkinsJobUrl}`);
                } else {
                    let hasResponse = false;

                    const waitStartTime = Date.now();
                    const jobUrl = await getJobUrl(response.headers.location, credentials)
                    while (!hasResponse) {
                        const currentTime = Date.now();
                        if (waitTimeout > -1) {
                            if (currentTime - waitStartTime > waitTimeout * 1000) {
                                console.log(`Jenkins job runs for longer then ${waitTimeout} second(s).`)
                                tl.setResult(tl.TaskResult.Failed, `Jenkins Job ${jenkinsJobUrl} timeout`);
                                return;
                            }
                        }

                        try {
                            const jobStatus = await getJobStatus(`${jobUrl}api/json`, jenkinsUsername, jenkinsApiToken);
                            if (!jobStatus.inProgress) {
                                if (jobStatus.result === "SUCCESS") {
                                    tl.setResult(tl.TaskResult.Succeeded, `Successfully triggered a Jenkins job ${jenkinsJobUrl}`);
                                } else {
                                    tl.setResult(tl.TaskResult.Failed, `Jenkins Job ${jenkinsJobUrl} had failed with the result '${jobStatus.result}'`);
                                }
                                return;
                            } else {
                                sleep(1000);
                            }
                        } catch (e) {
                            tl.setResult(tl.TaskResult.Failed, `Cannot get status of the job ${jenkinsJobUrl}: ${e}`);
                            return;
                        }
                    }
                }
            }
        } catch (error: any) {
            console.log(error);
            tl.setResult(tl.TaskResult.Failed, error.response.data.error);
        }
    }
    catch (err) {
        if (err instanceof Error) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        } else {
            tl.setResult(tl.TaskResult.Failed, 'Failed to trigger job');
        }
    }
}

async function getJobUrl(queueUrl: string, credentials: string) : Promise<String> {
    let ready = false;
    let url = null;

    while(!ready) {
        const response = await axios.get(`${queueUrl}api/json`, {
            headers: {
                'User-Agent': 'Trigger Jenkins Job Azure DevOps Task v1.0.0',
                'Authorization': `Basic ${credentials}`,
            }
        });

        if (response.status != 200) {
            throw new Error(`Unexpected response from Jenkins host while querying queue item: ${response.status}`);
        }

        if (response.data.executable) {
            ready = true;
            url = response.data.executable.url;
        }

        if (!ready) {
            sleep(1000);
        }
    }

    console.log(`Triggered job URL: ${url}`);
    return url;
}

function sleep(milliseconds: number) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

async function getJobStatus(jobUrl: string, username: string, apiToken: string) : Promise<JobStatus> {
    console.log(`Querying current status of the '${jobUrl}' job`);
    const credentials = Buffer.from(`${username}:${apiToken}`).toString('base64');
    const response = await axios.get(jobUrl, {
        headers: {
            'User-Agent': 'Trigger Jenkins Job Azure DevOps Task v1.0.0',
            'Authorization': `Basic ${credentials}`,
        }
    });
    if (response.status !== 200 && response.status !== 404) {
        throw new Error(`Unexpected response from Jenkins host: ${response.status}`);
    } else {
        if (response.status === 404) {
            return {
                currentNumber: undefined,
                inProgress: undefined,
                result: undefined,
            }
        } else {
            return {
                currentNumber: response.data.number,
                inProgress: response.data.inProgress,
                result: response.data.result,
            }
        }
    }
}

run();
