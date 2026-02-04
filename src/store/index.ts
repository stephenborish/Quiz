import { reactive, computed } from 'vue';

export interface AppState {
    user: {
        email: string | null;
        role: 'TEACHER' | 'STUDENT' | null;
        isAuthenticated: boolean;
    };
    currentQuizId: string | null;
    quizzes: any[];
    courses: any[];
    isLoading: boolean;
}

const state = reactive<AppState>({
    user: {
        email: null,
        role: null,
        isAuthenticated: false,
    },
    currentQuizId: null,
    quizzes: [],
    courses: [],
    isLoading: false,
});

export const useStore = () => {
    return {
        state,
        isTeacher: computed(() => state.user.role === 'TEACHER'),
        isStudent: computed(() => state.user.role === 'STUDENT'),
        setLoading: (val: boolean) => (state.isLoading = val),
    };
};
