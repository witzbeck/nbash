// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

type NotebookCell = {
	cell_type: 'code' | 'markdown';
	source: string[];
	metadata?: any;  // Include any additional optional properties as needed
	execution_count?: number;  // Only relevant for code cells
};

const controller = vscode.notebooks.createNotebookController(
	'shell-command-controller',
	'jupyter-notebook',
	'Shell Command Executor'
);

controller.supportsExecutionOrder = false;
controller.executeHandler = (cells) => {
	cells.forEach(cell => {
		if (cell.document.getText().startsWith('!')) {
			executeShellCommand(cell.document.getText().slice(1).trim());
		}
	});
};

function executeShellCommand(command: string) {
	vscode.window.showInformationMessage(`Execute command: ${command}?`, 'Yes', 'No')
		.then(answer => {
			if (answer === 'Yes') {
				const terminal = vscode.window.createTerminal(`Ext Terminal`);
				terminal.sendText(command);
				terminal.show();
			}
		});
}

function parseAndRunCommands(notebook: any) {
	notebook.cells.forEach((cell: NotebookCell) => {
		if (cell.cell_type === 'code') {
			cell.source.forEach((line: string) => {
				const trimmedLine = line.trim();
				if (trimmedLine.startsWith('!')) {
					const command = trimmedLine.slice(1).trim();
					if (command) {  // Ensure the command is not empty
						executeShellCommand(command);
					}
				}
			});
		}
	});
}


async function openNotebook(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('nbsh.openNotebook', async () => {
		const editor = vscode.window.activeTextEditor;
		if (editor && editor.document.fileName.endsWith('.ipynb')) {
			try {
				const uri = editor.document.uri;
				const contentUint8 = await vscode.workspace.fs.readFile(uri);
				const content = Buffer.from(contentUint8).toString('utf8');
				const notebook = JSON.parse(content);
				parseAndRunCommands(notebook);
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to read or parse the notebook: ${error}`);
			}
		} else {
			vscode.window.showErrorMessage('No active notebook file.');
		}
	});
	context.subscriptions.push(disposable);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Extension "nbsh" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('nbsh.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from notebook-shell-passthrough!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
