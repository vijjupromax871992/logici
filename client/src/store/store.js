import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import themeReducer from './slices/themeSlice';

const store = configureStore({
    reducer: {
        user: userReducer,
        cart: cartReducer,
        theme: themeReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(thunk),
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;
