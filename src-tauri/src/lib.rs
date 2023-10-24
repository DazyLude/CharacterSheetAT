pub mod character_data;
pub mod ipc;
pub mod disk_interactions;
pub mod app_state;
pub mod menu;

pub mod logger {
    pub fn log_tauri_error(event: tauri::Event) {
        match event.payload() {
            Some(payload) => println!("{}", payload),
            None => println!("error happened, somewhere, somehow"),
        }
    }
}

pub mod command {
    use std::{collections::VecDeque, marker::PhantomData};

    const DEFAULT_STACK_CAPACITY : usize = 50;

    pub trait Commandable {}
    pub trait Command<M : Commandable> {
        fn execute(&self, apply_to: &mut M);
        fn undo(&self, apply_to: &mut M);
    }

    /// stack - currently memorised commands
    /// bottom_size - amount of commands that are left before reverting to the starting state
    /// stack_size_limit - amount of commands that are saved in the stack before it starts discarding ones in the beginning
    pub struct CommandStack<T, M> where T: Command<M>, M: Commandable {
        stack: VecDeque<T>,
        distance_from_front: usize,
        stack_size_limit: usize,
        phantom: PhantomData<M>,
    }

    impl<T, M> CommandStack<T, M> where T: Command<M>, M: Commandable {
        pub fn new() -> CommandStack<T, M> {
            CommandStack {
                stack: VecDeque::with_capacity(DEFAULT_STACK_CAPACITY),
                distance_from_front: 0,
                stack_size_limit: DEFAULT_STACK_CAPACITY,
                phantom: PhantomData,
            }
        }
        pub fn undo_one(&mut self, apply_to: &mut M) {
            if self.distance_from_front == 0 {
                return;
            }
            self.distance_from_front -= 1;
            self.stack.get(self.distance_from_front).unwrap().undo(apply_to);
        }
        pub fn do_one(&mut self, one: T, apply_to: &mut M) {
            one.execute(apply_to);
            if self.distance_from_front != self.stack.len()  {
                self.discard_top();
            }
            self.stack.push_back(one);
            if self.distance_from_front == self.stack_size_limit {
                self.stack.pop_front();
            } else {
                self.distance_from_front += 1;
            }
        }
        pub fn redo_one(&mut self, apply_to: &mut M) {
            if self.distance_from_front == self.stack.len() {
                return;
            }
            self.stack.get(self.distance_from_front).unwrap().execute(apply_to);
            self.distance_from_front += 1;

        }
        pub fn discard_top(&mut self) {
            self.stack.drain(self.distance_from_front..self.stack.len());
        }
    }
}