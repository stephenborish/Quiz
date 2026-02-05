import { reactive, computed } from 'vue';
import { initialAppState } from '../firebase/config';

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

const defaultState: AppState = {
    user: {
        email: null,
        role: null,
        isAuthenticated: false,
    },
    currentQuizId: null,
    quizzes: [],
    courses: [],
    isLoading: false,
};

// Hydrate from GAS if available
if (initialAppState) {
    defaultState.user.email = initialAppState.userEmail;
    defaultState.user.role = initialAppState.isTeacher ? 'TEACHER' : 'STUDENT';
    // If we have an email from GAS, we are authenticated
    defaultState.user.isAuthenticated = !!initialAppState.userEmail;
}

const state = reactive<AppState>(defaultState);

export const useStore = () => {
    return {
        state,
        isTeacher: computed(() => state.user.role === 'TEACHER'),
        isStudent: computed(() => state.user.role === 'STUDENT'),
        setLoading: (val: boolean) => (state.isLoading = val),
        initializeAuth: async () => {
            if (initialAppState?.authToken) {
                try {
                    const { auth } = await import('../firebase');
                    const { signInWithCustomToken } = await import('firebase/auth');
                    await signInWithCustomToken(auth, initialAppState.authToken);
                    console.log('Firebase Auth initialized via custom token');
                    state.user.isAuthenticated = true;
                } catch (e) {
                    console.error('Auth initialization failed', e);
                }
            }
        }
    };
};
