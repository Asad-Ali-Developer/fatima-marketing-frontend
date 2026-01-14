// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./slices";

// ✅ Create store ONLY on the client
let store: ReturnType<typeof makeStore>;

function makeStore() {
  return configureStore({
    reducer: {
      auth: userReducer,
    },
  });
}

// ✅ Safe store getter
export const getStore = () => {
  if (typeof window === "undefined") {
    // On server, return a new store (not used)
    return makeStore();
  }

  // On client, reuse existing store
  if (!store) {
    store = makeStore();
  }
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
