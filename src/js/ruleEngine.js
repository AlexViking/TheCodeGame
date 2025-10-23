import Debug from './debug.js';

export class RuleEngine {
	constructor() {
		Debug.logInit('RuleEngine');

		this.checkFunctions = {
			contains: (code, params) => code.includes(params.text),
			regex: (code, params) => new RegExp(params.pattern, params.flags || '').test(code),
			count: (code, params) => (code.match(new RegExp(params.pattern, 'g')) || []).length >= params.min,
			custom: (code, params) => eval(params.function)(code),
			complex: (code, params) => eval(params.function)(code)
		};

		Debug.logInit('RuleEngine initialized', {
			availableCheckTypes: Object.keys(this.checkFunctions)
		});
	}

	validate(code, rules, currentRuleIndex) {
		Debug.logRuleValidation('Starting validation', {
			codeLength: code.length,
			totalRules: rules.length,
			currentRuleIndex: currentRuleIndex,
			activeRules: currentRuleIndex + 1
		});

		const results = {
			currentRulePassed: false,
			allPreviousRulesPassed: true,
			ruleResults: []
		};

		rules.forEach((rule, index) => {
			if (index <= currentRuleIndex) {
				const passed = this.checkRule(code, rule);

				Debug.logRuleValidation(`Rule ${rule.id} check`, {
					ruleIndex: index,
					ruleId: rule.id,
					checkType: rule.checkType,
					passed: passed,
					isCurrentRule: index === currentRuleIndex
				});

				results.ruleResults.push({
					ruleId: rule.id,
					passed: passed
				});

				if (index === currentRuleIndex && passed) {
					results.currentRulePassed = true;
				}

				if (index < currentRuleIndex && !passed) {
					results.allPreviousRulesPassed = false;
					Debug.logRuleValidation(`Previous rule failed`, {
						ruleIndex: index,
						ruleId: rule.id
					});
				}
			}
		});

		Debug.logRuleValidation('Validation completed', {
			currentRulePassed: results.currentRulePassed,
			allPreviousRulesPassed: results.allPreviousRulesPassed,
			passedRules: results.ruleResults.filter(r => r.passed).length,
			totalChecked: results.ruleResults.length
		});

		return results;
	}

	checkRule(code, rule) {
		Debug.logRuleValidation(`Checking rule ${rule.id}`, {
			ruleId: rule.id,
			checkType: rule.checkType,
			hasAdditionalChecks: !!(rule.additionalChecks && rule.additionalChecks.length > 0)
		});

		const checkFunction = this.checkFunctions[rule.checkType];
		if (!checkFunction) {
			const error = `Unknown check type: ${rule.checkType}`;
			Debug.logError(new Error(error), `Rule ${rule.id} validation`);
			console.warn(error);
			return false;
		}

		try {
			const mainCheck = checkFunction(code, rule.checkParams);
			Debug.logRuleValidation(`Main check for rule ${rule.id}`, {
				ruleId: rule.id,
				passed: mainCheck,
				checkType: rule.checkType
			});

			// Check additional checks if they exist
			if (rule.additionalChecks && mainCheck) {
				Debug.logRuleValidation(`Running additional checks for rule ${rule.id}`, {
					ruleId: rule.id,
					additionalChecksCount: rule.additionalChecks.length
				});

				const additionalResults = rule.additionalChecks.map((additionalCheck, index) => {
					const additionalCheckFunction = this.checkFunctions[additionalCheck.checkType];
					if (!additionalCheckFunction) {
						Debug.logError(new Error(`Unknown additional check type: ${additionalCheck.checkType}`), `Rule ${rule.id} additional check ${index}`);
						return false;
					}

					const result = additionalCheckFunction(code, additionalCheck.checkParams);
					Debug.logRuleValidation(`Additional check ${index} for rule ${rule.id}`, {
						ruleId: rule.id,
						checkIndex: index,
						checkType: additionalCheck.checkType,
						passed: result
					});

					return result;
				});

				const allAdditionalPassed = additionalResults.every(result => result);
				Debug.logRuleValidation(`All additional checks for rule ${rule.id}`, {
					ruleId: rule.id,
					allPassed: allAdditionalPassed,
					results: additionalResults
				});

				return allAdditionalPassed;
			}

			return mainCheck;

		} catch (error) {
			Debug.logError(error, `Rule ${rule.id} validation execution`);
			return false;
		}
	}

	createCheckFunction(type, params) {
		Debug.logRuleValidation('Creating check function', {
			checkType: type,
			hasParams: params !== null && params !== undefined
		});

		const checkFunction = this.checkFunctions[type];
		if (!checkFunction) {
			Debug.logError(new Error(`Cannot create check function for unknown type: ${type}`), 'Check function creation');
			return () => false;
		}

		return (code) => checkFunction(code, params);
	}
}