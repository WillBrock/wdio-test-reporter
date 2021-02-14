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
			retries      : runner.retries,
			retry        : runner.retry,
			spec_id      : runner.specs[0].match(/([^/]+)\.js/)[1],
			passed       : runner.failures === 0 ? 1 : 0,
			skipped      : 0,
			failed       : runner.failures > 0 ? 1 : 0,
			tests        : [],
			title        : this.suites[this.suites.length - 1].title,
		};

		let total_skipped = 0;
		let total_tests   = 0;

		for(const tmp_suite of this.suites) {
			const suite = this.getEventsToReport(tmp_suite);

			for(const test of suite) {
				const state = test.state;

				const test_data = {
					title    : test.title,
					start    : test.start,
					end      : test.end,
					duration : test._duration,
					passed   : state === `passed` ? 1 : 0,
					failed   : state === `failed` ? 1 : 0,
					skipped  : state === `skipped` ? 1 : 0,
				};

				total_tests++;

				if(state === `skipped`) {
					total_skipped++;
				}

				suite_data.tests.push(test_data);
			}
		}

		if(total_tests === total_skipped) {
			suite_data.skipped = 1;
			suite_data.passed  = 0;
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
/*
{
	"project_id" : 1234,
	"run_date" : "",
	"title" : "Foobar",
	"suites_ran" : "Login",
	"duration" : 150,
	"version" : "2.8.5",
	"passed" : 1,
	"failed" : 0,
	"suites" : [
		{
			"title" : "Foo",
			"capabilities" : "Linux/firefox",
			"duration" : 2671,
			"start" : "",
			"end" : "",
			"spec_file" : "foobar.e2e.js",
			"passed" : 1,
			"failed" : 0,
			"skipped" : 0,
			"retries" : 2,
			"tests" : [
				{
					"title" : "Test login",
					"duration" : 1982,
					"start" : "",
					"end" : "",
					"passed" : 1,
					"failed" : 0,
					"skipped" : 0,
					"errors" : []
				}
			]
		}
	]
}

"type": "test",
				"start": "2021-02-13T19:47:32.414Z",
				"_duration": 5,
				"uid": "test-10-0",
				"cid": "0-0",
				"title": "some type of test",
				"fullTitle": "Foo bar baz hello some type of test",
				"output": [],
				"retries": 0,
				"state": "passed",
				"end": "2021-02-13T19:47:32.419Z"
*/
