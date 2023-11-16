use std::collections::VecDeque;

const DEFAULT_STACK_CAPACITY : usize = 50;

pub trait Command<T> {
    fn execute(&self, apply_to: &mut T) -> Result<(), String>;
    fn undo(&self, apply_to: &mut T);
}

/// stack - currently memorised commands
/// bottom_size - amount of commands that are left before reverting to the starting state
/// stack_size_limit - amount of commands that are saved in the stack before it starts discarding ones in the beginning
pub struct CommandStack<T, C> where T: Command<C> {
    pub data: C,
    stack: VecDeque<T>,
    distance_from_front: usize,
    stack_size_limit: usize,
}

impl<T, C> CommandStack<T, C> where T: Command<C> {
    pub fn with_initial(data: C) -> CommandStack<T, C> {
        CommandStack {
            data,
            stack: VecDeque::with_capacity(DEFAULT_STACK_CAPACITY),
            distance_from_front: 0,
            stack_size_limit: DEFAULT_STACK_CAPACITY,
        }
    }
    pub fn undo_one(&mut self) {
        if self.distance_from_front == 0 {
            return;
        }
        self.distance_from_front -= 1;
        self.stack.get(self.distance_from_front).unwrap().undo(&mut self.data);
    }
    pub fn do_one(&mut self, one: T) -> Result<(), String> {
        one.execute(&mut self.data)?;
        self.push_one(one);
        Ok(())
    }
    pub fn push_one(&mut self, one: T) {
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

    pub fn redo_one(&mut self) {
        if self.distance_from_front == self.stack.len() {
            return;
        }
        // this has been done once already (when do_one is executed), so no check needed
        let _ = self.stack.get(self.distance_from_front).unwrap().execute(&mut self.data);
        self.distance_from_front += 1;

    }
    pub fn discard_top(&mut self) {
        self.stack.drain(self.distance_from_front..self.stack.len());
    }
}