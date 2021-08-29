import ma = require('azure-pipelines-task-lib/mock-answer');
import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '..', 'index.js');
let tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);
tmr.setInput('jenkinsJobUrl', process.env.JENKINS_URL ?? '');
tmr.setInput('jenkinsUsername', process.env.JENKINS_USERNAME ?? '');
tmr.setInput('jenkinsApiToken', process.env.JENKINS_API_TOKEN ?? '');

tmr.run();
