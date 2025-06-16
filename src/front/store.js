export const initialStore = () => {
  return {
    message: null,
    auth: {
      token: sessionStorage.getItem('token'),
      user: JSON.parse(sessionStorage.getItem('user')),
      isAuthenticated: !!sessionStorage.getItem('token'),
      error: null
    },
    files: {
      list: [],
      currentFile: null,
      sortOrder: 'asc',
      sortField: 'name',
      error: null
    },
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      }
    ]
  }
}

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };

    // Auth actions
    case 'auth/login':
      sessionStorage.setItem('token', action.payload.token);
      sessionStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...store,
        auth: {
          ...store.auth,
          token: action.payload.token,
          user: action.payload.user,
          isAuthenticated: true,
          error: null
        }
      };

    case 'auth/logout':
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return {
        ...store,
        auth: {
          token: null,
          user: null,
          isAuthenticated: false,
          error: null
        }
      };

    case 'auth/setError':
      return {
        ...store,
        auth: {
          ...store.auth,
          error: action.payload
        }
      };

    // Files actions
    case 'files/setList':
      return {
        ...store,
        files: {
          ...store.files,
          list: action.payload,
          error: null
        }
      };

    case 'files/setCurrentFile':
      return {
        ...store,
        files: {
          ...store.files,
          currentFile: action.payload,
          error: null
        }
      };

    case 'files/setSorting':
      return {
        ...store,
        files: {
          ...store.files,
          sortOrder: action.payload.sortOrder,
          sortField: action.payload.sortField
        }
      };

    case 'files/setError':
      return {
        ...store,
        files: {
          ...store.files,
          error: action.payload
        }
      };

    case 'add_task':
      const { id, color } = action.payload
      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };
    default:
      throw Error('Unknown action.');
  }
}
