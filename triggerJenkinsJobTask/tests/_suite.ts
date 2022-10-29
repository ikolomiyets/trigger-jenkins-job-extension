import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('Trigger Jenkins Job task tests', function () {

    before( function() {

    });

    after(() => {

    });

    it('should fail with simple inputs', function(done: Mocha.Done) {
        this.timeout(50000);

        let tp = path.join(__dirname, 'failure.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        assert.strictEqual(tr.succeeded, false, 'should have succeeded');
        assert.strictEqual(tr.warningIssues.length, 0, "should have no warnings");
        assert.strictEqual(tr.errorIssues.length, 1, "should have 1 error");
        assert.strictEqual(tr.errorIssues[0], "Jenkins Job https://jenkins.iktech.io/job/test-2 had failed with the result 'FAILURE'");
        done();
    });

    it('should timeout with simple inputs', function(done: Mocha.Done) {
        this.timeout(50000);

        let tp = path.join(__dirname, 'timeout.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        assert.strictEqual(tr.succeeded, false, 'should have succeeded');
        assert.strictEqual(tr.warningIssues.length, 0, "should have no warnings");
        assert.strictEqual(tr.errorIssues.length, 1, "should have 1 errors");
        assert.strictEqual(tr.errorIssues[0], 'Jenkins Job https://jenkins.iktech.io/job/test timeout');
        done();
    });

    it('should succeed with simple inputs', function(done: Mocha.Done) {
        this.timeout(50000);

        let tp = path.join(__dirname, 'success.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.warningIssues.length, 0, "should have no warnings");
        assert.strictEqual(tr.errorIssues.length, 0, "should have no errors");
        assert.strictEqual(tr.stdout.indexOf('Successfully triggered a Jenkins job https://jenkins.iktech.io/job/test') >= 0, true, "should display success message");
        done();
    });

    it('should succeed with parameters', function(done: Mocha.Done) {
        this.timeout(20000);

        let tp = path.join(__dirname, 'successWithParameters.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        assert.strictEqual(tr.succeeded, true, 'should have succeeded');
        assert.strictEqual(tr.warningIssues.length, 0, "should have no warnings");
        assert.strictEqual(tr.errorIssues.length, 0, "should have no errors");
        assert.strictEqual(tr.stdout.indexOf('Successfully triggered a Jenkins job https://jenkins.iktech.io/job/test-param') >= 0, true, "should display success message");
        done();
    });

    it('it should fail if jenkinsJobUrl is not specified', function(done: Mocha.Done) {
        this.timeout(1000);

        let tp = path.join(__dirname, 'jenkinsJobUrl.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        assert.strictEqual(tr.succeeded, false, 'should have failed');
        assert.strictEqual(tr.warningIssues.length, 0, "should have no warnings");
        assert.strictEqual(tr.errorIssues.length, 1, "should have 1 error issue");
        assert.strictEqual(tr.errorIssues[0], 'Input required: jenkinsJobUrl', 'error issue output');
        assert.strictEqual(tr.stdout.indexOf('Successfully triggered a Jenkins job '), -1, "Should not display success message");

        done();
    });

    it('it should fail if jenkinsUsername is not specified', function(done: Mocha.Done) {
        this.timeout(1000);

        let tp = path.join(__dirname, 'username.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        assert.strictEqual(tr.succeeded, false, 'should have failed');
        assert.strictEqual(tr.warningIssues.length, 0, "should have no warnings");
        assert.strictEqual(tr.errorIssues.length, 1, "should have 1 error issue");
        assert.strictEqual(tr.errorIssues[0], 'Input required: jenkinsUsername', 'error issue output');
        assert.strictEqual(tr.stdout.indexOf('Successfully triggered a Jenkins job '), -1, "Should not display success message");

        done();
    });

    it('it should fail if jenkinsApiToken is not specified', function(done: Mocha.Done) {
        this.timeout(1000);

        let tp = path.join(__dirname, 'apiToken.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        assert.strictEqual(tr.succeeded, false, 'should have failed');
        assert.strictEqual(tr.warningIssues.length, 0, "should have no warnings");
        assert.strictEqual(tr.errorIssues.length, 1, "should have 1 error issue");
        assert.strictEqual(tr.errorIssues[0], 'Input required: jenkinsApiToken', 'error issue output');
        assert.strictEqual(tr.stdout.indexOf('Successfully triggered a Jenkins job '), -1, "Should not display success message");

        done();
    });

    it('it should fail if authenticationToken is not specified', function(done: Mocha.Done) {
        this.timeout(1000);

        let tp = path.join(__dirname, 'authenticationToken.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        tr.run();
        assert.strictEqual(tr.succeeded, false, 'should have failed');
        assert.strictEqual(tr.warningIssues.length, 0, "should have no warnings");
        assert.strictEqual(tr.errorIssues.length, 1, "should have 1 error issue");
        assert.strictEqual(tr.errorIssues[0], 'Input required: authenticationToken', 'error issue output');
        assert.strictEqual(tr.stdout.indexOf('Successfully triggered a Jenkins job '), -1, "Should not display success message");

        done();
    });
});
