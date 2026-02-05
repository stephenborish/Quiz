import { reactive, computed } from 'vue';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useStore } from './index';

export interface StudentState {
    status: 'IDLE' | 'JOINING' | 'ACTIVE' | 'SUBMITTED';
    sessionId: string | null;
    quizId: string | null;
    studentName: string;
    currentQuestionIndex: number;
    answers: Record<string, string>; // questionId -> optionId
    confidence: Record<string, number>; // questionId -> 1, 2, 3
    quizData: any | null; // The loaded quiz
}

const state = reactive<StudentState>({
    status: 'IDLE',
    sessionId: null,
    quizId: null,
    studentName: '',
    currentQuestionIndex: 0,
    answers: {},
    confidence: {},
    quizData: null
});

export const useStudentStore = () => {
    const mainStore = useStore();

    const joinSession = async (code: string, name: string) => {
        state.status = 'JOINING';
        try {
            state.studentName = name;

            // Allow joining 'DEMO'
            if (code.toUpperCase() === 'DEMO') {
                state.sessionId = 'demo_session_' + Date.now();
                state.quizData = {
                    title: 'Calculus Demo (Mock)',
                    questions: [
                        {
                            id: 'q1',
                            text: 'What is the limit of (sin x)/x as x approaches 0?',
                            imageUrl: null,
                            options: [
                                { id: 'a', text: '0' },
                                { id: 'b', text: '1' },
                                { id: 'c', text: 'Undefined' },
                                { id: 'd', text: 'Infinity' }
                            ]
                        }
                    ]
                };
                state.status = 'ACTIVE';
                return;
            }

            // Real Firestore Logic
            const quizRef = doc(db, 'quizzes', code);
            const quizSnap = await getDoc(quizRef);

            if (!quizSnap.exists()) {
                throw new Error('Invalid Session Code');
            }

            state.quizId = code;
            state.sessionId = crypto.randomUUID();

            // 1. Listen to Quiz Updates
            onSnapshot(quizRef, (doc) => {
                if (doc.exists()) {
                    state.quizData = doc.data();
                }
            });

            // 2. Create/Update Session Doc for Proctoring
            await registerSession();

            state.status = 'ACTIVE';
            console.log('Joined session:', state.sessionId);

        } catch (e) {
            console.error('Join failed:', e);
            state.status = 'IDLE';
            alert('Failed to join session: ' + (e as Error).message);
        }
    };

    const registerSession = async () => {
        if (!state.quizId || !state.sessionId) return;

        const sessionRef = doc(db, `quizzes/${state.quizId}/sessions`, state.sessionId);
        await setDoc(sessionRef, {
            id: state.sessionId,
            name: state.studentName,
            status: 'ACTIVE',
            progress: 0,
            currentQuestion: 1,
            lastActive: serverTimestamp(),
            integrityAlerts: 0
        });
    };

    const updateProgress = async () => {
        if (!state.quizId || !state.sessionId) return;

        const progress = state.quizData ? Math.round(((state.currentQuestionIndex) / state.quizData.questions.length) * 100) : 0;
        const sessionRef = doc(db, `quizzes/${state.quizId}/sessions`, state.sessionId);

        await updateDoc(sessionRef, {
            progress: progress,
            currentQuestion: state.currentQuestionIndex + 1,
            lastActive: serverTimestamp()
        });
    }

    const submitAnswer = async (questionId: string, optionId: string, confidenceLvl: number) => {
        state.answers[questionId] = optionId;
        state.confidence[questionId] = confidenceLvl;

        // Advance
        if (state.quizData && state.currentQuestionIndex < state.quizData.questions.length - 1) {
            state.currentQuestionIndex++;
            updateProgress(); // Fire and forget update
        } else {
            state.status = 'SUBMITTED';
            if (state.quizId && state.sessionId) {
                const sessionRef = doc(db, `quizzes/${state.quizId}/sessions`, state.sessionId);
                await updateDoc(sessionRef, {
                    status: 'SUBMITTED',
                    progress: 100,
                    lastActive: serverTimestamp()
                });
            }
        }
    };

    return {
        state,
        joinSession,
        submitAnswer,
        activeQuestion: computed(() => state.quizData?.questions[state.currentQuestionIndex]),
        totalQuestions: computed(() => state.quizData?.questions?.length || 0)
    };
};
