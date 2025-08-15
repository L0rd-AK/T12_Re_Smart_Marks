import { baseApi } from "./baseApi";

export const coursesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
  // Courses endpoints
    getCourses: builder.query<any, void>({
      query: () => '/courses',
      providesTags: ['Course'],
    }),
    })
});

export const {
useGetCoursesQuery
} = coursesApi;