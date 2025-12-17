import { configureStore } from '@reduxjs/toolkit';
import snowflakeReducer from '../features/snowflake/snowflakeSlice';
import drawingReducer from '../features/drawing/drawingSlice';
import historyReducer from '../features/history/historySlice';

export const store = configureStore({
  reducer: {
    snowflake: snowflakeReducer,
    history: historyReducer,
    drawing: drawingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
