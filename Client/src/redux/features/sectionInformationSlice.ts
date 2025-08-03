import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface SectionInformationState {
    department: string;
    section: string;
    batch: string;
    semester: string;
    courseTitle: string;
    courseCode: string;
    year: string;
    isSubmitted: boolean;
    courseCredit?: string; // Optional field for course credit
    noOfClassConducted?: string; // Optional field for number of classes conducted
}

const initialState: SectionInformationState = {
    department: "",
    section: "",
    batch: "",
    semester: "",
    courseTitle: "",
    courseCode: "",
    year: new Date().getFullYear().toString(),
    isSubmitted: false,
    courseCredit: undefined, // Initialize as undefined
    noOfClassConducted: undefined // Initialize as undefined
};

const sectionInformationSlice = createSlice({
    name: 'sectionInformation',
    initialState,
    reducers: {
        setSectionInfo: (state, action: PayloadAction<Omit<SectionInformationState, 'isSubmitted'>>) => {
            return {
                ...state,
                ...action.payload,
                isSubmitted: true
            };
        },
        updateSectionField: (
            state,
            action: PayloadAction<{ field: keyof Omit<SectionInformationState, 'isSubmitted'>; value: string }>
        ) => {
            const { field, value } = action.payload;
            state[field] = value;
        },
        resetSectionInfo: () => {
            return {
                ...initialState,
                year: new Date().getFullYear().toString()
            };
        },
        clearSectionInfo: () => initialState
    },
});

// Selectors
export const selectSectionInformation = (state: RootState) => state.sectionInformation;
export const selectIsSubmitted = (state: RootState) => state.sectionInformation.isSubmitted;

export const {
    setSectionInfo,
    updateSectionField,
    resetSectionInfo,
    clearSectionInfo
} = sectionInformationSlice.actions;

export default sectionInformationSlice.reducer;