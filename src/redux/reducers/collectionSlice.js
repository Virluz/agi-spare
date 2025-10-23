// collectionsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storeFrontClient from '../../graphql/storeFrontClient';
import { collections_query } from '../../graphql/queries/collections/collections_query';

export const fetchCollections = createAsyncThunk(
    'collections/fetchCollections',
    async (first = 10) => {
        console.log("collectionsQuery first", first);

        try {
            const response = await storeFrontClient.request(collections_query, { first });
            console.log("collectionsQuery response", response.collections?.edges.map(edge => edge.node));

            return response.collections?.edges.map(edge => edge.node);
        } catch (error) {
            console.log("error", error);

        }

    }
);

const collectionsSlice = createSlice({
    name: 'collections',
    initialState: {
        collections: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCollections.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCollections.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.collections = action.payload;
            })
            .addCase(fetchCollections.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    }
});

export default collectionsSlice.reducer;