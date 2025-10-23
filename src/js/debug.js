class DebugManager {
	constructor() {
		this.enabled = false;
		this.logs = [];
		this.maxLogs = 1000;
		this.setupKeyboardShortcut();
		this.createDebugPanel();
	}

	setupKeyboardShortcut() {
		document.addEventListener('keydown', (event) => {
			if (event.shiftKey && event.key === 'D') {
				this.toggle();
			}
		});
	}

	toggle() {
		this.enabled = !this.enabled;
		this.updateDebugPanel();
		this.log('DEBUG', `Debug mode ${this.enabled ? 'ENABLED' : 'DISABLED'}`);

		// Show toast notification
		this.showToast(`Debug mode ${this.enabled ? 'ON' : 'OFF'}`);
	}

	log(category, message, data = null) {
		const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);

		// Safely clone data to avoid circular references and undefined issues
		let clonedData = null;
		if (data) {
			try {
				clonedData = JSON.parse(JSON.stringify(data));
			} catch (e) {
				clonedData = { error: 'Failed to serialize data', originalError: e.message };
			}
		}

		const logEntry = {
			timestamp,
			category,
			message,
			data: clonedData
		};

		this.logs.push(logEntry);

		// Keep only recent logs
		if (this.logs.length > this.maxLogs) {
			this.logs = this.logs.slice(-this.maxLogs);
		}

		if (this.enabled) {
			const style = this.getCategoryStyle(category);
			console.log(
				`%c[${timestamp}] ${category}: %c${message}`,
				style.category,
				style.message,
				data || ''
			);
		}

		this.updateDebugPanel();
	}

	getCategoryStyle(category) {
		const styles = {
			'INIT': {
				category: 'color: #4ecca3; font-weight: bold;',
				message: 'color: #fff;'
			},
			'GAME': {
				category: 'color: #f39c12; font-weight: bold;',
				message: 'color: #fff;'
			},
			'RULE': {
				category: 'color: #e94560; font-weight: bold;',
				message: 'color: #fff;'
			},
			'LEVEL': {
				category: 'color: #9b59b6; font-weight: bold;',
				message: 'color: #fff;'
			},
			'UI': {
				category: 'color: #3498db; font-weight: bold;',
				message: 'color: #fff;'
			},
			'DEBUG': {
				category: 'color: #95a5a6; font-weight: bold;',
				message: 'color: #fff;'
			},
			'ERROR': {
				category: 'color: #e74c3c; font-weight: bold;',
				message: 'color: #fff;'
			}
		};

		return styles[category] || styles['DEBUG'];
	}

	createDebugPanel() {
		// Create debug panel CSS
		const style = document.createElement('style');
		style.textContent = `
			.debug-panel {
				position: fixed;
				top: 10px;
				right: 10px;
				width: 300px;
				max-height: 400px;
				background: rgba(26, 26, 46, 0.95);
				border: 2px solid #4ecca3;
				color: #eee;
				font-family: 'Courier New', monospace;
				font-size: 10px;
				z-index: 9999;
				display: none;
				overflow: hidden;
			}

			.debug-header {
				background: #4ecca3;
				color: #000;
				padding: 5px 10px;
				font-weight: bold;
				display: flex;
				justify-content: space-between;
				align-items: center;
			}

			.debug-buttons {
				display: flex;
				gap: 5px;
			}

			.debug-logs {
				max-height: 350px;
				overflow-y: auto;
				padding: 10px;
			}

			.debug-log-entry {
				margin-bottom: 5px;
				padding: 2px 0;
				border-bottom: 1px solid rgba(255,255,255,0.1);
			}

			.debug-timestamp {
				color: #95a5a6;
			}

			.debug-category {
				font-weight: bold;
				margin: 0 5px;
			}

			.debug-category.INIT { color: #4ecca3; }
			.debug-category.GAME { color: #f39c12; }
			.debug-category.RULE { color: #e94560; }
			.debug-category.LEVEL { color: #9b59b6; }
			.debug-category.UI { color: #3498db; }
			.debug-category.DEBUG { color: #95a5a6; }
			.debug-category.ERROR { color: #e74c3c; }

			.debug-message {
				color: #fff;
			}

			.debug-button {
				background: none;
				border: none;
				color: #000;
				cursor: pointer;
				font-size: 8px;
				padding: 2px 5px;
				margin: 0 2px;
				transition: background-color 0.2s;
			}

			.debug-button:hover {
				background-color: rgba(0,0,0,0.1);
			}

			.debug-indicator {
				position: fixed;
				top: 10px;
				right: 10px;
				background: #4ecca3;
				color: #000;
				padding: 5px 10px;
				font-family: 'Press Start 2P', monospace;
				font-size: 8px;
				z-index: 10000;
				display: none;
			}

			.debug-toast {
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				background: rgba(0,0,0,0.9);
				color: #4ecca3;
				padding: 20px 40px;
				font-family: 'Press Start 2P', monospace;
				font-size: 12px;
				z-index: 10001;
				border: 2px solid #4ecca3;
				animation: debugToast 2s ease-in-out;
			}

			@keyframes debugToast {
				0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
				20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
			}
		`;
		document.head.appendChild(style);

		// Create debug panel HTML
		const panel = document.createElement('div');
		panel.className = 'debug-panel';
		panel.id = 'debugPanel';
		panel.innerHTML = `
			<div class="debug-header">
				<span>DEBUG MODE</span>
				<div class="debug-buttons">
					<button class="debug-button" onclick="window.Debug.copyLogs()">COPY</button>
					<button class="debug-button" onclick="window.Debug.clearLogs()">CLEAR</button>
				</div>
			</div>
			<div class="debug-logs" id="debugLogs"></div>
		`;
		document.body.appendChild(panel);

		// Create debug indicator
		const indicator = document.createElement('div');
		indicator.className = 'debug-indicator';
		indicator.id = 'debugIndicator';
		indicator.textContent = 'DEBUG';
		document.body.appendChild(indicator);
	}

	updateDebugPanel() {
		const panel = document.getElementById('debugPanel');
		const indicator = document.getElementById('debugIndicator');
		const logsContainer = document.getElementById('debugLogs');

		if (this.enabled) {
			panel.style.display = 'block';
			indicator.style.display = 'block';

			// Update logs
			logsContainer.innerHTML = this.logs.slice(-50).map(log => `
				<div class="debug-log-entry">
					<span class="debug-timestamp">[${log.timestamp}]</span>
					<span class="debug-category ${log.category}">${log.category}</span>
					<span class="debug-message">${log.message}</span>
				</div>
			`).join('');

			// Scroll to bottom
			logsContainer.scrollTop = logsContainer.scrollHeight;
		} else {
			panel.style.display = 'none';
			indicator.style.display = 'none';
		}
	}

	clearLogs() {
		this.logs = [];
		this.updateDebugPanel();
		this.log('DEBUG', 'Logs cleared');
	}

	copyLogs() {
		if (this.logs.length === 0) {
			this.showToast('No logs to copy');
			return;
		}

		// Format logs as text
		const logText = this.logs.map(log => {
			const dataText = log.data ? ` | ${JSON.stringify(log.data)}` : '';
			return `[${log.timestamp}] ${log.category}: ${log.message}${dataText}`;
		}).join('\n');

		// Copy to clipboard
		navigator.clipboard.writeText(logText).then(() => {
			this.showToast(`Copied ${this.logs.length} logs to clipboard`);
			this.log('DEBUG', `Copied ${this.logs.length} logs to clipboard`);
		}).catch(err => {
			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = logText;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);

			this.showToast(`Copied ${this.logs.length} logs to clipboard`);
			this.log('DEBUG', `Copied ${this.logs.length} logs to clipboard (fallback method)`);
		});
	}

	showToast(message) {
		const toast = document.createElement('div');
		toast.className = 'debug-toast';
		toast.textContent = message;
		document.body.appendChild(toast);

		setTimeout(() => {
			document.body.removeChild(toast);
		}, 2000);
	}

	// Helper methods for common logging patterns
	logGameFlow(action, details) {
		this.log('GAME', action, details);
	}

	logRuleValidation(message, data) {
		this.log('RULE', message, data);
	}

	logLevelEvent(event, levelId, data) {
		this.log('LEVEL', `${event} - ${levelId}`, data);
	}

	logUIEvent(event, data) {
		this.log('UI', event, data);
	}

	logInit(component, data) {
		this.log('INIT', `${component} initialized`, data);
	}

	logError(error, context) {
		this.log('ERROR', error.message || error, { context, stack: error.stack });
	}
}

// Create global debug instance
window.Debug = new DebugManager();

export default window.Debug;