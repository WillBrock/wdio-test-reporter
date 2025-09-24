import btoa         from 'btoa';
import stripAnsi    from 'strip-ansi';
import WDIOReporter from '@wdio/reporter';
import { driver }   from '@wdio/globals';

export default class TestReporter extends WDIOReporter {
	constructor(options = {}) {
		options = Object.assign({
			stdout : false,
		}, options);

		super(options);

		this.options = options;
		this.suites  = [];
		this.cid     = null;
		this.results = null;
	}

	onSuiteEnd(suite) {
		this.suites.push(suite);
	}

	onRunnerEnd(runner) {
		this.setOutput(runner);
		this.writeOutput();
	}

	setOutput(runner) {
		const { capabilities }  = runner;
		const spec_file_retries = driver.options.specFileRetries;
		const spec_file         = runner.specs[0].match(/([^/]+\.js)/)[1];
		const suite             = this.suites[this.suites.length - 1];
		const suite_title       = suite ? suite.title : `Can't find suite title for ${spec_file}`;

		const suite_data = {
			capabilities : `${capabilities.platformName}/${capabilities.browserName} ${capabilities.browserVersion}`,
			duration     : runner._duration,
			retries      : runner.retry,
			spec_file    : spec_file,
			filepath     : suite.file,
			passed       : runner.failures === 0 ? 1 : 0,
			skipped      : 0,
			failed       : runner.failures > 0 ? 1 : 0,
			tests        : [],
			title        : suite_title,
			start        : runner.start,
		};

		let total_skipped = 0;
		let total_tests   = 0;

		// This will get used if they are using mocha retires and not specFileRetries
		let max_retries = 0;

		for(const tmp_suite of this.suites) {
			const suite = this.getEventsToReport(tmp_suite);

			const unique_tests       = {};
			const unique_test_errors = {};
			for(const test of suite) {
				const identifier = btoa(test.title);
				const state      = test.state;

				const test_data = {
					type     : suite.type,
					title    : test.title,
					duration : test._duration,
					passed   : state === `passed` ? 1 : 0,
					failed   : state === `failed` ? 1 : 0,
					skipped  : state === `skipped` ? 1 : 0,
					retries  : !spec_file_retries ? test.retries : runner.retry,
				};

				total_tests++;

				if(state === `skipped`) {
					total_skipped++;
				}

				if(max_retries < test.retries) {
					max_retries = test.retries;
				}

				if(!unique_test_errors[identifier]) {
					unique_test_errors[identifier] = [];
				}

				if(test.error) {
					unique_test_errors[identifier].push({
						message    : stripAnsi(test.error.message),
						stacktrace : stripAnsi(test.error.stack),
					});
				}

				unique_tests[identifier] = test_data;
			}

			// Add the unique test data and errors
			for(const identifier in unique_tests) {
				unique_tests[identifier].errors = unique_test_errors[identifier];
				suite_data.tests.push(unique_tests[identifier]);
			}
		}

		if(total_tests === total_skipped) {
			suite_data.skipped = 1;
			suite_data.passed  = 0;
		}

		// Force the test to be marked as skipped if it fails to get any suite data, this.suites
		if(total_tests === 0 && total_skipped === 0) {
			suite_data.failed = 0;
		}

		if(!spec_file_retries) {
			suite_data.retries = max_retries;
		}

		// Store the results
		this.results = suite_data;
	}

	writeOutput() {
		this.write(JSON.stringify(this.results, null, `\t`));
	}

	getEventsToReport(suite) {
		return [
			...suite.tests,
			...suite.hooks.filter((hook) => Boolean(hook.error)),
		];
	}
}
