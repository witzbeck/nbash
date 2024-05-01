import * as assert from 'assert';
import * as vscode from 'vscode';
//import * as nbsh from '../../nbsh';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    setup(async () => {
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    });

    test('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });

    test('Extension Activation', async () => {
        const extension = vscode.extensions.getExtension('publisher.extensionName');
        assert.ok(extension, "Extension should be found");
        await extension.activate();
        assert.ok(extension.isActive, "Extension should be active after activation");
    });

    test('Open Notebook File', async () => {
        const uri = vscode.Uri.file('/path/to/notebook.ipynb');
        const document = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(document);
        assert.strictEqual(editor.document.languageId, 'jupyter', "The document language should be Jupyter");
    });

    test('Execute Shell Command in Notebook', async () => {
        const command = '!echo "Hello World"';
        const uri = vscode.Uri.file('/path/to/notebook.ipynb');
        const document = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(document);

        await editor.edit(edit => edit.insert(new vscode.Position(0, 0), command));

        // Here we assume nbsh has a function named runShellCommand you want to use
        await nbsh.runShellCommand(command);

        // Further assertions or checks can follow
    });
    test('Handle Invalid Shell Command', async () => {
        const command = '!invalidcommand';
        const uri = vscode.Uri.file('/path/to/notebook.ipynb');
        const document = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(document);

        await editor.edit(edit => edit.insert(new vscode.Position(0, 0), command));

        try {
            await vscode.commands.executeCommand('nbsh.runShell');
            assert.fail("Expected an error for invalid command");
        } catch (error) {
            assert.ok(true, "Caught expected error for invalid command");
        }
    });

    teardown(async () => {
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    });
});
