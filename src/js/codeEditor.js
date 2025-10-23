import Debug from './debug.js';

export class CodeEditor {
	constructor() {
		Debug.logInit('CodeEditor');
		this.codeInput = null;
		this.lineNumbers = null;
		this.errorIndicators = null;
		this.currentErrors = [];
		this.initializeEditor();
	}

	initializeEditor() {
		this.codeInput = document.getElementById('codeInput');
		this.lineNumbers = document.getElementById('lineNumbers');
		this.errorIndicators = document.getElementById('errorIndicators');

		if (!this.codeInput || !this.lineNumbers || !this.errorIndicators) {
			Debug.logError(new Error('Code editor elements not found'), 'CodeEditor initialization');
			return;
		}

		this.bindEvents();
		this.updateLineNumbers();

		Debug.logInit('CodeEditor initialized successfully');
	}

	bindEvents() {
		// Update line numbers on input
		this.codeInput.addEventListener('input', () => {
			this.updateLineNumbers();
		});

		// Update line numbers on scroll to keep them in sync
		this.codeInput.addEventListener('scroll', () => {
			this.lineNumbers.scrollTop = this.codeInput.scrollTop;
		});

		// Handle keyboard events
		this.codeInput.addEventListener('keydown', (e) => {
			// Tab key for indentation
			if (e.key === 'Tab') {
				e.preventDefault();
				this.insertTab();
			}
		});
	}

	updateLineNumbers() {
		const lines = this.codeInput.value.split('\n');
		const lineCount = lines.length;

		// Generate line numbers
		let lineNumbersContent = '';
		for (let i = 1; i <= lineCount; i++) {
			lineNumbersContent += i + '\n';
		}

		this.lineNumbers.textContent = lineNumbersContent;

		// Keep scroll in sync
		this.lineNumbers.scrollTop = this.codeInput.scrollTop;

		Debug.logUIEvent('Line numbers updated', { lineCount });
	}

	insertTab() {
		const start = this.codeInput.selectionStart;
		const end = this.codeInput.selectionEnd;
		const value = this.codeInput.value;

		// Insert tab (2 spaces)
		const newValue = value.substring(0, start) + '  ' + value.substring(end);
		this.codeInput.value = newValue;

		// Move cursor
		this.codeInput.selectionStart = this.codeInput.selectionEnd = start + 2;

		// Update line numbers
		this.updateLineNumbers();
	}

	analyzeCode(code, currentRule, ruleValidationResults) {
		Debug.logUIEvent('Analyzing code for errors', {
			codeLength: code.length,
			currentRuleId: currentRule?.id,
			ruleCompleted: ruleValidationResults?.currentRulePassed || false
		});

		this.clearErrors();

		// If current rule is already passed, don't show any hints
		if (ruleValidationResults?.currentRulePassed) {
			return [];
		}

		const lines = code.split('\n');
		const errors = [];

		// Only show rule-specific hints for incomplete rules
		if (currentRule && !ruleValidationResults?.currentRulePassed) {
			// Check each line for rule-specific issues
			lines.forEach((line, lineIndex) => {
				const trimmedLine = line.trim();
				if (trimmedLine.length === 0) return;

				const ruleHint = this.getRuleSpecificHint(trimmedLine, currentRule, code);
				if (ruleHint) {
					errors.push({
						line: lineIndex + 1,
						message: ruleHint,
						type: 'hint'
					});
				}
			});
		}

		// Only show general syntax errors if no rule-specific hints
		if (errors.length === 0) {
			const syntaxErrors = this.checkSyntaxErrors(code, lines);
			errors.push(...syntaxErrors);
		}

		this.displayErrors(errors);
		Debug.logUIEvent('Code analysis completed', { errorsFound: errors.length });

		return errors;
	}

	checkSyntaxErrors(code, lines) {
		const errors = [];

		// Common HTML error patterns - only show critical syntax errors
		const errorPatterns = [
			{
				pattern: /<(\w+)[^>]*>(?!.*<\/\1>)/g,
				message: (match) => `Unclosed tag: ${match[1]}. Add closing tag </${match[1]}>`
			},
			{
				pattern: /<\/(\w+)>/g,
				message: (match, code) => {
					const openTag = `<${match[1]}`;
					if (!code.includes(openTag)) {
						return `Closing tag </${match[1]}> without opening tag`;
					}
					return null;
				}
			}
		];

		lines.forEach((line, lineIndex) => {
			const trimmedLine = line.trim();
			if (trimmedLine.length === 0) return;

			errorPatterns.forEach(errorPattern => {
				const matches = [...line.matchAll(errorPattern.pattern)];
				matches.forEach(match => {
					const message = errorPattern.message(match, code);
					if (message) {
						errors.push({
							line: lineIndex + 1,
							message: message,
							type: 'syntax'
						});
					}
				});
			});
		});

		return errors;
	}

	getRuleSpecificHint(line, rule, fullCode) {
		// Provide specific hints based on current rule and line content
		switch (rule.id) {
			case 2: // <p> tag rule
				// Only show hint if line has text but no p tags, and p tags don't exist elsewhere
				if (this.hasTextContent(line) && !line.includes('<p>') && !line.includes('</p>')) {
					if (!fullCode.includes('<p>') || !fullCode.includes('</p>')) {
						return "Wrap this text in <p> and </p> tags";
					}
				}
				break;

			case 3: // <h1> tag rule
				// Show hint only if we have content that could be a heading and h1 doesn't exist
				if (this.hasTextContent(line) && !line.includes('<h1>') && !fullCode.includes('<h1>')) {
					// Don't show on lines that already have p tags
					if (!line.includes('<p>')) {
						return "Add a <h1> heading tag here";
					}
				}
				break;

			case 4: // List rule
				// Show hint if line has text that could be list item and no list exists
				if (this.hasTextContent(line) && !fullCode.includes('<ul>') && !line.includes('<li>')) {
					if (!line.includes('<p>') && !line.includes('<h1>')) {
						return "Create list items with <li> tags inside <ul>";
					}
				}
				break;

			case 5: // Link rule
				// Show hint if line has text that could be a link
				if (this.hasTextContent(line) && !line.includes('<a') && !fullCode.includes('<a')) {
					if (!line.includes('<li>') || fullCode.includes('<ul>')) {
						return "Add a link: <a href=\"URL\">link text</a>";
					}
				}
				break;

			case 6: // Bold and italic rule
				// Show hint if line has text but missing both strong and em
				if (this.hasTextContent(line)) {
					const needsStrong = !fullCode.includes('<strong>');
					const needsEm = !fullCode.includes('<em>');

					if (needsStrong && !line.includes('<strong>')) {
						return "Make some text bold with <strong>";
					} else if (needsEm && !line.includes('<em>')) {
						return "Make some text italic with <em>";
					}
				}
				break;

			case 7: // HTML document structure
				// Show specific hints based on what's missing
				const needsHtml = !fullCode.includes('<html>');
				const needsHead = !fullCode.includes('<head>');
				const needsBody = !fullCode.includes('<body>');

				if (needsHtml && line.length > 0 && !line.includes('<html>')) {
					return "Start with <html> tag";
				} else if (needsHead && line.length > 0 && !line.includes('<head>')) {
					return "Add <head> section";
				} else if (needsBody && this.hasTextContent(line) && !line.includes('<body>')) {
					return "Wrap content in <body> tag";
				}
				break;
		}
		return null;
	}

	hasTextContent(line) {
		// Check if line has actual text content (not just tags)
		const withoutTags = line.replace(/<[^>]*>/g, '').trim();
		return withoutTags.length > 0;
	}

	displayErrors(errors) {
		this.currentErrors = errors;
		this.errorIndicators.innerHTML = '';

		errors.forEach(error => {
			const indicator = document.createElement('div');
			indicator.className = 'error-indicator';
			indicator.textContent = '!';
			indicator.style.top = `${(error.line - 1) * 21}px`; // 21px line height

			const tooltip = document.createElement('div');
			tooltip.className = 'error-tooltip';
			tooltip.textContent = error.message;

			indicator.appendChild(tooltip);
			this.errorIndicators.appendChild(indicator);
		});

		Debug.logUIEvent('Error indicators displayed', { count: errors.length });
	}

	clearErrors() {
		this.currentErrors = [];
		this.errorIndicators.innerHTML = '';
	}

	getCode() {
		return this.codeInput ? this.codeInput.value : '';
	}

	setCode(code) {
		if (this.codeInput) {
			this.codeInput.value = code;
			this.updateLineNumbers();
		}
	}

	focus() {
		if (this.codeInput) {
			this.codeInput.focus();
		}
	}
}