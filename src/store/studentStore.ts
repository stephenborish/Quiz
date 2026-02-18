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

let joinInFlight: Promise<void> | null = null;
let submitInFlight = false;
let sessionRegistered = false;

export const useStudentStore = () => {
    const mainStore = useStore();

    const getSessionRef = () => {
        if (!state.quizId || !state.sessionId) throw new Error('No active session');
        // Path: sessions/{quizId}/students/{email}
        return doc(db, 'sessions', state.quizId, 'students', state.sessionId);
    };

    const getResponseRef = () => {
        if (!state.quizId || !state.sessionId) throw new Error('No active session');
        // Path: responses/{quizId}/students/{email}
        return doc(db, 'responses', state.quizId, 'students', state.sessionId);
    };

    const joinSession = async (code: string, name: string) => {
        if (joinInFlight) {
            return joinInFlight;
        }

        joinInFlight = (async () => {
        state.status = 'JOINING';
        try {
            state.studentName = name;

            // Allow joining 'DEMO'
            if (code.toUpperCase() === 'DEMO') {
                state.sessionId = 'demo_user';
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
            const email = mainStore.state.user.email;
            if (!email) {
                 // Fallback for dev/testing if not authenticated via GAS
                 console.warn('No user email found. Are you authenticated?');
                 if (import.meta.env.DEV) {
                     // Allow dev without email if strictly testing locally?
                     // But rules require email. So this will fail.
                     throw new Error('Authentication required. Please refresh.');
                 }
                 throw new Error('Authentication required. Please refresh.');
            }

            const quizRef = doc(db, 'quizzes', code);
            const quizSnap = await getDoc(quizRef);

            if (!quizSnap.exists()) {
                throw new Error('Invalid Session Code');
            }

            state.quizId = code;
            state.sessionId = email; // Use email as session ID
            sessionRegistered = false;

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
        } finally {
            joinInFlight = null;
        }
        })();

        return joinInFlight;
    };

    const registerSession = async () => {
        if (!state.quizId || !state.sessionId || sessionRegistered) return;

        // Skip for demo
        if (state.sessionId === 'demo_user') return;

        const sessionRef = getSessionRef();
        await setDoc(sessionRef, {
            email: state.sessionId, // ID is email
            displayName: state.studentName,
            status: 'active', // Lowercase to match rules? Rules check 'active'
            progress: 0,
            currentQuestion: 1,
            lastActive: serverTimestamp(),
            connectedAt: serverTimestamp(),
            integrityAlerts: 0
        }, { merge: true });

        sessionRegistered = true;
    };

    const updateProgress = async () => {
        if (!state.quizId || !state.sessionId) return;

        // Skip for demo
        if (state.sessionId === 'demo_user') return;

        const progress = state.quizData ? Math.round(((state.currentQuestionIndex) / state.quizData.questions.length) * 100) : 0;
        const sessionRef = getSessionRef();

        await updateDoc(sessionRef, {
            progress: progress,
            currentQuestion: state.currentQuestionIndex + 1,
            lastActive: serverTimestamp()
        });
    }

    const saveResponse = async () => {
        if (!state.quizId || !state.sessionId) return;

        // Skip for demo
        if (state.sessionId === 'demo_user') return;

        const responseRef = getResponseRef();

        // Construct answers object for Firestore
        // Format: answers: { [questionId]: { answer: string, confidence: number, ... } }
        const answersPayload: Record<string, any> = {};
        for (const [qId, ans] of Object.entries(state.answers)) {
            answersPayload[qId] = {
                answer: ans,
                confidence: state.confidence[qId] || 1,
                answeredAt: new Date() // Client timestamp, ideally serverTimestamp but inside map it's tricky
            };
        }

        await setDoc(responseRef, {
            email: state.sessionId,
            quizId: state.quizId,
            answers: answersPayload,
            totalQuestions: state.quizData?.questions?.length || 0,
            lastUpdated: serverTimestamp()
        }, { merge: true });

    };

    const submitAnswer = async (questionId: string, optionId: string, confidenceLvl: number) => {
        if (submitInFlight || state.status === 'SUBMITTED') return;

        submitInFlight = true;
        try {
            state.answers[questionId] = optionId;
            state.confidence[questionId] = confidenceLvl;

            // Save progress to Firestore Response
            await saveResponse();

            // Advance
            if (state.quizData && state.currentQuestionIndex < state.quizData.questions.length - 1) {
                state.currentQuestionIndex++;
                await updateProgress();
            } else {
                state.status = 'SUBMITTED';
                // Only update Firestore if not demo
                if (state.quizId && state.sessionId && state.sessionId !== 'demo_user') {
                    const sessionRef = getSessionRef();
                    await updateDoc(sessionRef, {
                        status: 'completed', // Rules check 'completed' ? Rules check != 'blocked'
                        progress: 100,
                        lastActive: serverTimestamp()
                    });

                    // Finalize response
                    const responseRef = getResponseRef();
                    await updateDoc(responseRef, {
                        completedAt: serverTimestamp()
                    });
                }
            }
        } finally {
            submitInFlight = false;
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
