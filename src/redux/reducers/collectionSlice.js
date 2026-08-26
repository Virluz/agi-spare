// collectionsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storeFrontClient from '../../graphql/storeFrontClient';
import { collections_query } from '../../graphql/queries/collections/collections_query';

// This is the curated order used by the "Shop By category" section on agispares.com.
const WEBSITE_CATEGORY_HANDLES = [
    'joystick',
    'switch',
    'connector',
    'relay',
    'safety-maintenance',
    'sensor',
    'angle-sensor',
    'engine-parts',
    'electronic-ground-card',
    'valve',
    'solenoid-coil',
    'dtz-actuator',
    'starter-alternator',
    'genie-parts',
    'boom-length-sensor-load-pin-sensor',
    'scissor-lift',
    'filter',
    'harness',
    'foam-filled-tire',
    'scissor-lift-tire',
    'xcmg-parts',
    'solid-tire',
];

export const fetchCollections = createAsyncThunk(
    'collections/fetchCollections',
    async (first = 10) => {
        console.log("collectionsQuery first", first);

        try {
            const response = await storeFrontClient.request(collections_query, { first });
            console.log("collectionsQuery response", response.collections?.edges.map(edge => edge.node));

            const collectionsByHandle = new Map(
                (response.collections?.edges || []).map(({ node }) => [node.handle, node])
            );

            // Return only the categories shown on the website, in the same order.
            return WEBSITE_CATEGORY_HANDLES
                .map(handle => collectionsByHandle.get(handle))
                .filter(Boolean);
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
