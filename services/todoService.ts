
import { Todo } from "../types";
import { api } from "./api";

export const getTodos = async (): Promise<Todo[]> => {
  return api.get<Todo[]>('/todos');
};

export const saveTodo = async (todo: Todo): Promise<Todo> => {
  return api.post<Todo>('/todos', todo);
};

export const updateTodo = async (updatedTodo: Todo): Promise<Todo> => {
  return api.put<Todo>(`/todos/${updatedTodo.id}`, updatedTodo);
};

export const deleteTodo = async (id: string): Promise<void> => {
  return api.delete(`/todos/${id}`);
};

export const addMultipleTodos = async (todosToAdd: Todo[]): Promise<void> => {
  return api.post('/todos/batch', { todos: todosToAdd });
};
