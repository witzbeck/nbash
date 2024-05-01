import * as vscode from 'vscode';
import * as path from 'path'; // Make sure to import the 'path' module


export function activate(context: vscode.ExtensionContext) {
    // Create a notebook controller for intercepting shell commands
    const controller = vscode.notebooks.createNotebookController(
        'shell-command-controller',    // Unique identifier for the controller
        'jupyter-notebook',            // Target notebook type
        'Shell Command Executor'       // Display name for the controller
    );

    // Disable automatic execution order handling
    controller.supportsExecutionOrder = false;

    // Handle cell execution events
    controller.executeHandler = async (cells, notebook, _controller) => {
        cells.forEach(cell => {
            if (cell.kind === vscode.NotebookCellKind.Code && cell.document.getText().trim().startsWith('!')) {
                // Execute shell command found in the code cell
                executeShellCommand(cell);
            }
        });
    };

    // Add the controller to the list of disposables to clean up on deactivation
    context.subscriptions.push(controller);
}

// Function to handle the execution of shell commands
function executeShellCommand(cell: vscode.NotebookCell) {
    const command = cell.document.getText().trim().slice(1);
    const notebookDir = path.dirname(cell.notebook.uri.fsPath); // Get the directory of the notebook file
    const terminal = vscode.window.createTerminal({
        name: `Shell Execution: Cell ${cell.index}`,
        cwd: notebookDir // Use the directory as the working directory
    });
    terminal.sendText(command);
    terminal.show();
}

// This method is called when your extension is deactivated
export function deactivate() {}
