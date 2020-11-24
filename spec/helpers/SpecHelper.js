
let store = {};

let scope = (typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

const mockLocalStorage = {
    getItem: (key) => {
    return store[key];
    },
    setItem: (key, value) => {
    store[key] = value.toString();
    },
    removeItem: (key) => {
    delete store[key];
    },
    clear: () => {
    store = {};
    }
};

scope.localStorage = mockLocalStorage;

beforeEach(() => {
    store = {};
});