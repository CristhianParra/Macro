"use strict";
import * as vscode from "vscode";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  const path = "c:/proyectos/macros.json";
  let recording = false;
  let commands: Array<{ command: string; args: any[] }> = [];
  let cachedCommands: Array<{
    command: string;
    disposable: vscode.Disposable;
  }> = [];
  let commandBlacklist = ["paste"];
  let macros;
  let lastCommandType = false;
  readMacros(path).then(definedMacros => {
    macros = definedMacros;
    objectForEach((macro, steps) => {
      console.log("register: " + `macro.${macro}`);
      vscode.commands.registerTextEditorCommand(`macro.${macro}`, () => {
        steps.forEach(command => {
          if (typeof command === "string") {
            vscode.commands.executeCommand(command);
          } else {
            vscode.commands.executeCommand(command.command, ...command.args);
          }
        });
      });
    }, definedMacros);
  });

  const startRecord = vscode.commands.registerTextEditorCommand(
    "macro.startRecord",
    () => {
      vscode.commands.getCommands(true).then(commands => {
        recording = true;
        vscode.commands.executeCommand(
          "setContext",
          "recordingMacro",
          recording
        );
        commands
          .filter(command => commandBlacklist.indexOf(command) === -1)
          .forEach(command => {
            try {
              const disposable = handleCommand(command);
              cachedCommands.push({
                command,
                disposable
              });
            } catch (e) {}
          });
      });
    }
  );

  const stopRecord = vscode.commands.registerTextEditorCommand(
    "macro.stopRecord",
    () => {
      cachedCommands.forEach(cachedCommand => {
        cachedCommand.disposable.dispose();
      });
      recording = false;
      vscode.commands.executeCommand("setContext", "recordingMacro", recording);
      vscode.window
        .showInputBox({
          prompt: "Ingresa el nombre del comando",
          validateInput: (value: string) => {
            return macros[value]
              ? `Macro: "${value}" alredy exists.`
              : null;
          }
        })
        .then(commandName => {
          macros[commandName] = [];
          commands.forEach(command => {
            macros[commandName].push(
              command.args.length ? command : command.command
            );
          });
          updateMacros(macros)
            .then(() => {
              vscode.commands.registerTextEditorCommand(
                `macro.${commandName}`,
                () => {
                  commands.forEach(command => {
                    vscode.commands.executeCommand(
                      command.command,
                      ...command.args
                    );
                  });
                }
              );
            })
            .catch(console.log);
        });
    }
  );

  const playRecord = vscode.commands.registerTextEditorCommand(
    "macro.playRecord",
    () => {
      vscode.window.showQuickPick(Object.keys(macros)).then(command => {
        macros[command].forEach(command => {
          if (typeof command === "string") {
            vscode.commands.executeCommand(command);
          } else {
            vscode.commands.executeCommand(command.command, ...command.args);
          }
        });
      });
    }
  );

  function handleCommand(command: string): vscode.Disposable {
    const handledCommand = vscode.commands.registerCommand(
      command,
      (...args) => {
        addCommand(command, ...args);
        handledCommand.dispose();
        vscode.commands.executeCommand(command, ...args);
        cachedCommands.push({ command, disposable: handleCommand(command) });
      }
    );
    return handledCommand;
  }

  function addCommand(command: string, ...args: any[]) {
    if (lastCommandType) {
      commands[commands.length - 1].args[0].text += args[0].text;
    } else {
      commands.push({
        command,
        args
      });
      if (command === "type") {
        lastCommandType = true;
      }
    }
  }

  function readMacros(path) {
    return new Promise(resolve => {
      fs.readFile(path, (err, data) => {
        resolve(err ? {} : JSON.parse(data.toString()));
      });
    });
  }

  function updateMacros(macros: object) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, JSON.stringify(macros, null, 2), err => {
        return err ? reject(err) : resolve();
      });
    });
  }

  function objectForEach(
    fn: (key: string, value: any) => void,
    obj: object
  ): void {
    Object.keys(obj).forEach(function(key) {
      fn(key, obj[key]);
    });
  }

  context.subscriptions.push(startRecord);
  context.subscriptions.push(stopRecord);
  context.subscriptions.push(playRecord);
}

export function deactivate() {}
