"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log("INIT");
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json

  let recording = false;
  let actions: string[] = [];

  const sayHello = vscode.commands.registerCommand("extension.sayHello", () => {
    vscode.window.showInformationMessage("Hello World!");
  });
  const disposable = vscode.commands.registerTextEditorCommand(
    "extension.switchRecording",
    () => {
      console.log("switch recording...");
      recording = !recording;
      vscode.commands.executeCommand("setContext", "recordingMacro", recording);
      if (!recording) {
        actions.forEach(action => {
          if (action === "ctrl") {
            vscode.commands.executeCommand("default:type", { text: "ctrl+q" });
          } else {
            vscode.commands.executeCommand("type", { text: action });
          }
        });
        actions = [];
      }
    }
  );

  const aDisposable = vscode.commands.registerTextEditorCommand(
    "extension.aPressed",
    () => {
      console.log("a pressed");
      vscode.commands.executeCommand("type", { text: "a" });
      if (recording) {
        actions.push("a");
      }
    }
  );
  const qDisposable = vscode.commands.registerTextEditorCommand(
    "extension.qPressed",
    () => {
      console.log("q pressed");
      vscode.commands.executeCommand("type", { text: "q" });
      if (recording) {
        actions.push("q");
      }
    }
  );

  const ctrlDisposable = vscode.commands.registerTextEditorCommand(
    "extension.ctrlQPressed",
    () => {
      console.log("ctrl + q");
      if (recording) {
        actions.push("ctrl");
      }
    }
  );

  let disposablew = vscode.commands.registerCommand("type", args => {
    vscode.window.showInformationMessage(JSON.stringify(args, null, 2));
    vscode.commands.executeCommand("default:type", {
      text: args.text
    });
  });

  let disposablecs = vscode.commands.registerCommand(
    "editor.action.clipboardCutAction",
    args => {
      if(args && args.fromExtension){
        console.log('AAAAA')
      }else {
        console.log('BBBBB')
        vscode.commands.executeCommand("editor.action.clipboardCutAction", {
          fromExtension: "called from ext"
        });
      }
    }
  );

  let disposablece = vscode.commands.registerCommand("compositionEnd", args => {
    console.log("COMP END", JSON.stringify(args, null, 2));
  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposablew);
  context.subscriptions.push(disposable);
  context.subscriptions.push(sayHello);
  context.subscriptions.push(aDisposable);
  context.subscriptions.push(qDisposable);
  context.subscriptions.push(ctrlDisposable);
  context.subscriptions.push(disposablecs);
  context.subscriptions.push(disposablece);
}

// this method is called when your extension is deactivated
export function deactivate() {}
//_workbench.captureSyntaxTokens
