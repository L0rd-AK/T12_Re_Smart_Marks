import { baseApi } from "./baseApi";

interface CourseResponse {
  success: boolean;
  data: Array<{
    _id: string;
    name: string;
    code: string;
    department: string;
    moduleLeader?: string;
  }>;
}

export const coursesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
  // Courses endpoints
    getCourses: builder.query<CourseResponse, void>({
      query: () => '/courses',
      providesTags: ['Course'],
    }),
    })
});

export const {
useGetCoursesQuery
} = coursesApi;