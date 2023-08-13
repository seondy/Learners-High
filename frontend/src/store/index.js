import { combineReducers } from "redux";
import UserStore from "./UserStore";
import EyeStore from "./EyeStore";
import { persistReducer } from "redux-persist";
// import storageSession from 'redux-persist/es/storage/session' // sessionStorage 구현
import storage from 'redux-persist/lib/storage';

const rootReducer = combineReducers({
  user: UserStore,
  EyeTracker: EyeStore,
});

const persistConfig = {
  key: "root",
  storage, // 세션에서 로컬스토리지 과닐로 변경
  whitelist: ["user"], // 유지하고 싶은 값을 배열로 전달
  blacklist: ["EyeTracker"], // 유지하기 싫은 값을 배열로 전달
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default persistedReducer;
