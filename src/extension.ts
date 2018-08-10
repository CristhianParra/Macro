"use strict";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let actions: string[] = [];

  const actionMap = {
    "cmd+left": "cursorHome",
    "shift+cmd+right": "cursorEndSelect",
    "cmd+c": "editor.action.clipboardCopyAction",
    "cmd+x": "editor.action.clipboardCutAction",
    "ctrl+n": "cursorDown",
    "cmd+v": "editor.action.clipboardPasteAction",
    "cmd+right": "cursorEnd"
  };

  //cmd+k cmd+c editor.action.addCommentLine

  const switchRecording = vscode.commands.registerTextEditorCommand(
    "macro.switchRecording",
    () => {
      vscode.commands.executeCommand("setContext", "recordingMacro", true);
    }
  );

  const playRecord = vscode.commands.registerTextEditorCommand(
    "macro.playRecord",
    () => {
      actions.forEach(action => {
        // vscode.commands.executeCommand("type", { text: action });
        vscode.commands.executeCommand(action);
      });
      actions = [];
      vscode.commands.executeCommand("setContext", "recordingMacro", false);
    }
  );

  const type = vscode.commands.registerCommand("type", args => {
    console.log(args.text);
    vscode.commands.executeCommand("default:type", {
      text: args.text
    });
  });

  objectForEach((keybinding, command) => {
    const internalCommand = keybindingToCommandName(keybinding);
    context.subscriptions.push(
      vscode.commands.registerCommand(internalCommand, _ => {
        console.log("Fake: " + keybinding);
        actions.push(command);
        vscode.commands.executeCommand(command);
      })
    );
  }, actionMap);

  context.subscriptions.push(
    vscode.commands.registerCommand("macro.fakeComment", _ => {
      console.log("Fake: comment");
      actions.push("editor.action.addCommentLine");
      vscode.commands.executeCommand("editor.action.addCommentLine");
    })
  );

  function keybindingToCommandName(keybinding: string): string {
    const chunks = keybinding.split("+");
    const capitalizedChunks = chunks.map(
      chunk => chunk.charAt(0).toUpperCase() + chunk.slice(1)
    );
    const command = capitalizedChunks.join("");
    return "macro.fake" + command;
  }

  function objectForEach(
    fn: (key: string, value: any) => void,
    obj: object
  ): void {
    Object.keys(obj).forEach(function(key) {
      fn(key, obj[key]);
    });
  }

  context.subscriptions.push(switchRecording);
  context.subscriptions.push(playRecord);
  context.subscriptions.push(type);
}

// this method is called when your extension is deactivated
export function deactivate() {}
//_workbench.captureSyntaxTokens
// editor.action.defineKeybinding
// workbench.action.inspectKeyMappings
// breakpointWidget.action.acceptInput
// _workbench.captureSyntaxTokens
// repl.action.acceptInput
// workbench.action.keybindingsReference
// workbench.action.inspectContextKeys
// workbench.action.openRawDefaultSettings
// workbench.action.openSettings
// workbench.action.openSettings2
// workbench.action.openGlobalSettings
// workbench.action.configureLanguageBasedSettings

//Nope pero util
// workbench.action.openGlobalKeybindingsFile
// workbench.action.openSettings

//KEYBINDINGS_EDITOR_COMMAND_DEFINE
// vscode.workspace.getConfiguration('emmet')
