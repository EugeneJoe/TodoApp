import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)
axios.defaults.baseURL = 'http://127.0.0.1:8000/todos/api'

export const store = new Vuex.Store({
  state: {
    filter: 'all',	
    todos: [],
  },
  getters: {
    remaining(state) {
      return state.todos.filter(todo => !todo.completed).length
    },
    anyRemaining(state, getters) {
      return getters.remaining != 0
    },
    myTodos(state) {
      if (state.filter == 'all') {
        return state.todos
      } else if (state.filter == 'active') {
        return state.todos.filter(todo => !todo.completed)
      } else if (state.filter == 'completed') {
        return state.todos.filter(todo => todo.completed)
      }

      return state.todos
    },
    showClearCompletedButton(state) {
      return state.todos.filter(todo => todo.completed).length > 0
    }
  },
  mutations: {
    addTodo(state, todo) {
      state.todos.push({
        id: todo.id,
	title: todo.title,
	completed: false,
	editing: false,
      })
    },
    updateTodo(state, todo) {
      const index = state.todos.findIndex(item => item.id == todo.id)
      state.todos.splice(index, 1, {
        'id': todo.id,
          'title': todo.title,
          'completed': todo.completed,
          'editing': todo.editing,
      })
    },
    deleteTodo(state, id) {
      const index = state.todos.findIndex(item => item.id == id)
      state.todos.splice(index, 1)
    },
    checkAll(state, checked) {
      state.todos.forEach(todo => (todo.completed = checked))
    },
    updateFilter(state, filter) {
      state.filter = filter
    },
    clearCompleted(state) {
      state.todos = state.todos.filter(todo => !todo.completed)
    },
    retrieveTodos(state, todos) {
      state.todos = todos	  
    },
  },
  actions: {
    retrieveTodos(context) {
      axios.get('/todo/')
        .then(response => {
	    context.commit('retrieveTodos', response.data)
        })
        .catch(error => {
	  console.log(error)
        })
    },
    addTodo(context, todo) {
      axios.post('/todo/', {
        title: todo.title,
        completed: false,
      })
        .then(response => {
            context.commit('addTodo', response.data)
        })
        .catch(error => {
          console.log(error)
        })
    },
    updateTodo(context, todo) {
      axios.patch(`/todo/${todo.id}/`, {
        title: todo.title,
        completed: todo.completed,
      })
        .then(response => {
            context.commit('updateTodo', response.data)
        })
        .catch(error => {
          console.log(error)
        })
    },
    deleteTodo(context, id) {
      axios.delete(`/todo/${id}/`)
        .then(response => {
            context.commit('deleteTodo', id)
        })
        .catch(error => {
          console.log(error)
        })
    },
    checkAll(context, checked) {
      const todos = context.getters.myTodos
      todos.forEach((todo) => {
        axios.patch(`/todo/${todo.id}/`, {
	  completed: checked,
        })
          .then(response => {
            context.commit('checkAll', checked)  
          })
          .catch(error => {
            console.log(error)
          })
      })
    },
    updateFilter(context, filter) {
      setTimeout(() => {
	context.commit('updateFilter', filter)
      }, 10)
    },
    clearCompleted(context) {
	const completed = context.getters.myTodos
	      .filter(todo => todo.completed)
	      .map(todo => todo.id)
	completed.forEach(id => {
	  axios.delete(`/todo/${id}/`)
            .then(response => {
              context.commit('deleteTodo', id)
          })
          .catch(error => {
            console.log(error)
          })
	})
    },
  }
})
