import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching user data
export const fetchUserData = createAsyncThunk(
    'user/fetchUserData',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for updating user data
export const updateUserData = createAsyncThunk(
    'user/updateUserData',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/users/${userData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                throw new Error('Failed to update user data');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Slice definition
const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        status: 'idle', // idle | loading | succeeded | failed
        error: null,
    },
    reducers: {
        clearUser: (state) => {
            state.user = null;
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle fetchUserData lifecycle
            .addCase(fetchUserData.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
            })
            .addCase(fetchUserData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Handle updateUserData lifecycle
            .addCase(updateUserData.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateUserData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
            })
            .addCase(updateUserData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

// Export actions and selectors
export const { clearUser } = userSlice.actions;
export const selectUser = (state) => state.user.user;
export const selectUserStatus = (state) => state.user.status;
export const selectUserError = (state) => state.user.error;

export default userSlice.reducer;
