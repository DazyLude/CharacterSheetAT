import { createContext, useCallback, useState, useMemo } from "react";

export const CommanderContext = createContext({
    undo: ()=>{},
    redo:()=>{},
    command: ()=>{},
});

// CommanderProvider is a react component that provides undo/redo queue functionality
// Commander accepts commands through commander interface shared through context
// Command has the following fields:
//  >   undo: function that reverts this command, accepts nothing, returns nothing
//  >   do: function that this command does, accepts and returns nothing
//      |   undo should reverse do and do should reverse undo
//      |   that's easier to achieve if they are pure
//      |   should behave as follows:
//        \     state1 => do() => state2 && state2 => undo() => state1
//          |   where state1 and state2 are states of data operated by commands
//  >   id: id of the command. Should be a String or a Number, so that === compares them correctly
//      |   required fo debugging purposes. can be an empty string, but I recommend using different id's for different operations
//  >   concat (optional): makes it so multiple commands with the same id can be concatenated.
//      |   useful for operations like text editing, or grid element moving, something
//      |   useful for operations like text editing, or grid element moving, something
//      | > takes the new command and the previous command, should return a new command
//      |   the previous command is then replaced with the returned value
//      |   should behave as follows:
//        \     concat(command1, command2).do() <=> command1.do(); command2.do();
//          |   concat(command1, command2).undo() <=> command2.undo(); command1.undo();
//          |   concat(command1, command2).id === command1.id === command2.id
//          |   concat(command1, command2).concat() is not required
//  >   shouldConcat (optional): function that returns a boolean value,
//      |   decides whether or not two commands with the same id should be concatenated
//      |   default is always true

export function CommanderProvider({children}) {
    const [commandQueue, setCommandQueue] = useState([]);
    const [lastIndex, setLastIndex] = useState(-1);

    const appendCommand = useCallback(
        (command) => {
            const undoFn = command.undo;
            if (undoFn === undefined || typeof(undoFn) !== 'function') {
                console.error("command doesn't have a proper undo method");
                return;
            }
            const doFn = command.do;
            if (doFn === undefined || typeof(doFn) !== 'function') {
                console.error("command doesn't have a proper do method");
                return;
            }
            const id = command.id;
            if (id === undefined || typeof(id) !== 'string') {
                console.error("command doesn't have a proper id");
                return;
            }
            if (commandQueue.length > 1 && command.id === commandQueue.slice(-1).id) {
                const concat = command.concat;
                if (concat !== undefined || typeof(concat) === 'function') {
                    const shouldConcat = command.shouldConcat ?? (() => {return true});
                    const previous = commandQueue.slice(lastIndex);
                    if (shouldConcat(previous, command)) {
                        const newCommand = command.concat(previous, command);
                        setCommandQueue([...commandQueue.slice(0, lastIndex), newCommand]);
                        doFn();
                        return;
                    }
                }
            }
            setCommandQueue([...commandQueue.slice(0, lastIndex + 1), command]);
            setLastIndex(lastIndex + 1);
            doFn();
        },
        [commandQueue, setCommandQueue, lastIndex]
    );

    const undoLast = useCallback(
        () => {
            if (lastIndex < 0) {
                return;
            }
            commandQueue[lastIndex].undo();
            setLastIndex(lastIndex - 1);
        },
        [commandQueue, lastIndex]
    );

    const redoLast = useCallback(
        () => {
            if (lastIndex === commandQueue.length - 1) {
                return;
            }
            commandQueue[lastIndex + 1].do();
            setLastIndex(lastIndex + 1);
        },
        [commandQueue, lastIndex]
    )

    const commanderInterface = useMemo(
        () => {
            console.log("recreated commander interface");
            return ({
                command: appendCommand,
                undo: undoLast,
                redo: redoLast,
            });
        },
        [appendCommand, undoLast, redoLast]
    );

    return (
        <CommanderContext.Provider value={commanderInterface}>
            {children}
        </CommanderContext.Provider>
    );
}