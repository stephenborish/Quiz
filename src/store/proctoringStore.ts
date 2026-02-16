import { reactive } from 'vue';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useStore } from './index';

export interface StudentSession {
    id: string; // Student ID or Email
    name: string;
    email: string;
    status: 'active' | 'idle' | 'disconnected' | 'blocked' | 'completed';
    progress: number; // 0-100
    currentQuestion: number;
    lastActive: any;
    integrityAlerts: number;
}

const state = reactive<{
    activeSessions: StudentSession[];
    isLoading: boolean;
    unsubscribe: (() => void) | null;
}>({
    activeSessions: [],
    isLoading: false,
    unsubscribe: null
});

export const useProctoringStore = () => {
    const mainStore = useStore();

    const startMonitoring = (quizId: string) => {
        if (state.unsubscribe) state.unsubscribe();
        state.isLoading = true;

        // Path: sessions/{quizId}/students
        try {
            const sessionsRef = collection(db, 'sessions', quizId, 'students');
            // Sort by lastActive desc
            const q = query(sessionsRef, orderBy('lastActive', 'desc'));

            state.unsubscribe = onSnapshot(q, (snapshot) => {
                state.activeSessions = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as unknown as StudentSession));
                state.isLoading = false;
            }, (error) => {
                console.error("Proctoring subscription error:", error);
                state.isLoading = false;
            });
        } catch (e) {
            console.error("Failed to start monitoring", e);
            state.isLoading = false;
        }
    };

    const stopMonitoring = () => {
        if (state.unsubscribe) {
            state.unsubscribe();
            state.unsubscribe = null;
        }
        state.activeSessions = [];
    };

    return {
        state,
        startMonitoring,
        stopMonitoring
    };
};
