// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./slices";

let store: ReturnType<typeof makeStore>;

function makeStore() {
  return configureStore({
    reducer: {
      auth: userReducer,
    },
  });
}

export const getStore = () => {
  if (typeof window === "undefined") {
    return makeStore();
  }
  if (!store) {
    store = makeStore();
  }
  return store;
};

// ✅ Export dispatch helper for non-React files
export const getDispatch = () => getStore().dispatch;

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
