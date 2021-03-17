# WebdriverIO Test Reporter

Outputs tests results in json files that are compatible with using the [wdio-test-reporter-service](https://github.com/WillBrock/wdio-test-reporter-service) to store results in [testreporter.io](https://testreporter.io)

This reporter will generate one report file for each spec file

## Add reporter to the config file

```
reporters : [[`test`, {
	outputDir : `./testreporter`
}]]
```

## Example File outputs

```
{
	"cid": "0-0",
	"capabilities": "linux/chrome 88.0.4324.96",
	"start": "2021-03-01T13:42:26.593Z",
	"end": "2021-03-01T13:42:32.049Z",
	"duration": 5456,
	"retries": 0,
	"spec_file": "JIRA-10565.js",
	"passed": 0,
	"skipped": 0,
	"failed": 1,
	"tests": [
		{
			"title": "Tries to log in without password ",
			"start": "2021-03-01T13:42:26.596Z",
			"end": "2021-03-01T13:42:31.975Z",
			"duration": 5379,
			"passed": 0,
			"failed": 1,
			"skipped": 0,
			"retries": 0,
			"errors": [
				{
					"message": "\u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBe\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // Object.is equality\u001b[22m\n\nExpected: \u001b[32m2\u001b[39m\nReceived: \u001b[31m1\u001b[39m",
					"stacktrace": "Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoBe\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m) // Object.is equality\u001b[22m\n\nExpected: \u001b[32m2\u001b[39m\nReceived: \u001b[31m1\u001b[39m\n    at Context.<anonymous> (/home/will/dev/FOCUS-28718/focus-automation/sis/modules/Login/Landing/tests/FOCUS-10565.js:9:13)"
				}
			]
		}
	],
	"title": "JIRA-10565 - Verify that you can't login with an empty or invalid password "
}
```
