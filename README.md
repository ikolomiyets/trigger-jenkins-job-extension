# Trigger Jenkins Job Extension

This extension allows to trigger a Job in the Jenkins instance from the Azure DevOps pipeline.

This extension provides the following task.

## `trigger-jenkins-job`
The task triggers a job identified with the URL in the Jenkins instance. The job in question must be configured to allow remote
triggering.
To do this, in the job configuration select a "Trigger builds remotely (e.g., from scripts)" build trigger and specify an authentication token for remote trigger.
A user whose credentials are used must be able to view Job as well as to run a build. To allow this make sure that the following permissions are set for the user in question:
* Job Workspace
* Job Read
* Job Build

## Inputs
### `jenkinsJobUrl`
**Required** The URL of the the job in question should be without final /build part. For example: https://jenkins.iktech.io/job/test
*Default:* N/A

### `jenkinsUsername`
**Required** The valid Jenkins user name that has access to a job it is triggering
*Default:* N/A

### `jenkinsApiToken`
**Required** The valid Jenkins API token for the user account.
*Default:* N/A

### `authenticationToken`
**Required** The authentication token specified in the trigger definition
*Default:* N/A

### `parameters`
Optional job parameters
*Default:* N/A

## Example
Before adding this task to your pipeline, set a secret with the user credentials and authentication token in your project.
Then, you can trigger Jenkins Job using following task:
```yaml
- task: trigger-jenkins-job@1
  inputs:
    jenkinsJobUrl: 'https://jenkins.iktech.io/job/test'
    jenkinsUsername: 'test'
    jenkinsApiToken: '<apiToken>'
    authenticationToken: '<authenticationToken>'
```


