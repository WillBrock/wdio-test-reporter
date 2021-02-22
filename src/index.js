const btoa         = require(`btoa`);
const WDIOReporter = require('@wdio/reporter').default;

class TestReporter extends WDIOReporter {
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
		const { capabilities } = runner;

		const suite_data = {
			cid          : runner.cid,
			capabilities : `${capabilities.platformName}/${capabilities.browserName} ${capabilities.browserVersion}`,
			start        : runner.start,
			end          : runner.end,
			duration     : runner._duration,
			retries      : runner.retry,
			spec_file    : runner.specs[0].match(/([^/]+\.js)/)[1],
			passed       : runner.failures === 0 ? 1 : 0,
			skipped      : 0,
			failed       : runner.failures > 0 ? 1 : 0,
			tests        : [],
			title        : this.suites[this.suites.length - 1].title,
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
					title    : test.title,
					start    : test.start,
					end      : test.end,
					duration : test._duration,
					passed   : state === `passed` ? 1 : 0,
					failed   : state === `failed` ? 1 : 0,
					skipped  : state === `skipped` ? 1 : 0,
					retries  : test.retries,
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
						message    : test.error.message,
						stacktrace : test.error.stack,
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

		if(!this.options.specFileRetries) {
			suite_data.retries = max_retries;
		}

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

exports.default = TestReporter;

