import { reactive, computed } from 'vue';
import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useStore } from './index';

export interface Question {
    id: string;
    text: string;
    imageUrl: string | null;
    options: {
        id: string;
        text: string;
        isCorrect: boolean;
    }[];
}

export interface Quiz {
    id: string | null;
    title: string;
    description?: string;
    questions: Question[];
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    createdAt?: any;
    updatedAt?: any;
}

const state = reactive<{
    activeQuiz: Quiz;
    isSaving: boolean;
    lastSaved: Date | null;
}>({
    activeQuiz: {
        id: null,
        title: 'Untitled Assessment',
        questions: [],
        status: 'DRAFT'
    },
    isSaving: false,
    lastSaved: null
});

export const useQuizStore = () => {
    const mainStore = useStore();

    const saveQuiz = async () => {
        state.isSaving = true;
        try {
            // Ensure we have an ID
            if (!state.activeQuiz.id) {
                state.activeQuiz.id = crypto.randomUUID();
            }

            const quizRef = doc(db, 'quizzes', state.activeQuiz.id);
            // Sanitize ONLY the quiz data to remove Vue proxies/undefined
            const quizData = JSON.parse(JSON.stringify(state.activeQuiz));

            const payload = {
                ...quizData,
                updatedAt: serverTimestamp(),
                authorEmail: mainStore.state.user.email
            };

            // If new, add created fields
            if (!state.lastSaved) {
                payload.createdAt = serverTimestamp();
            }

            await setDoc(quizRef, payload, { merge: true });

            state.lastSaved = new Date();
            console.log('Quiz saved successfully:', state.activeQuiz.id);
        } catch (e) {
            console.error('Failed to save quiz:', e);
            throw e;
        } finally {
            state.isSaving = false;
        }
    };

    const loadQuiz = async (id: string) => {
        state.isSaving = true;
        try {
            const docRef = doc(db, 'quizzes', id);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                state.activeQuiz = snap.data() as Quiz;
                state.lastSaved = new Date(); // Approximate
            }
        } catch (e) {
            console.error('Failed to load quiz:', e);
        } finally {
            state.isSaving = false;
        }
    };

    return {
        state,
        saveQuiz,
        loadQuiz,
        addQuestion: () => {
            state.activeQuiz.questions.push({
                id: Date.now().toString(),
                text: '',
                imageUrl: null,
                options: [
                    { id: 'a', text: '', isCorrect: true },
                    { id: 'b', text: '', isCorrect: false },
                    { id: 'c', text: '', isCorrect: false },
                    { id: 'd', text: '', isCorrect: false },
                ]
            });
        },
        updateQuestion: (idx: number, q: Question) => {
            state.activeQuiz.questions[idx] = q;
        }
    };
};
