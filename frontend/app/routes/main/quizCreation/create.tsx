import { Button } from "~/components/Button";
import { Modal } from "~/components/Modal";
import { ToggleSwitch } from "~/components/ToggleSwitch";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function CreateQuiz() {
    const navigate = useNavigate();
    const [quizTitle, setQuizTitle] = useState("");
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const createEmptyQuestion = () => ({
        questionTitle: "",
        answerOptions: [
            { text: "", correct: false },
            { text: "", correct: false },
            { text: "", correct: false },
            { text: "", correct: false },
        ],
    });

    const [questions, setQuestions] = useState([createEmptyQuestion()]);

    const isSubmitDisabled =
        !quizTitle.trim() ||
        questions.some(
            (question) =>
                !question.questionTitle.trim() ||
                question.answerOptions.some((option) => !option.text.trim()) ||
                !question.answerOptions.some((option) => option.correct)
        );

    const hasCorrectAnswer = (questionIndex: number) =>
        questions[questionIndex].answerOptions.some((option) => option.correct);

    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                questionTitle: "",
                answerOptions: [
                    { text: "", correct: false },
                    { text: "", correct: false },
                    { text: "", correct: false },
                    { text: "", correct: false },
                ],
            },
        ]);
    };

    const updateQuestionTitle = (index: number, value: string) => {
        setQuestions((prev) =>
            prev.map((question, i) => (i === index ? { ...question, questionTitle: value } : question))
        );
    };

    const updateAnswerOption = (questionIndex: number, answerIndex: number, value: string) => {
        setQuestions((prev) =>
            prev.map((question, i) => {
                if (i !== questionIndex) return question;
                const updatedAnswers = [...question.answerOptions];
                updatedAnswers[answerIndex] = { ...updatedAnswers[answerIndex], text: value };
                return { ...question, answerOptions: updatedAnswers };
            })
        );
    };

    const toggleCorrectAnswer = (questionIndex: number, answerIndex: number, isChecked: boolean) => {
        setQuestions((prev) =>
            prev.map((question, i) => {
                if (i !== questionIndex) return question;
                return {
                    ...question,
                    answerOptions: question.answerOptions.map((answer, j) =>
                        j === answerIndex ? { ...answer, correct: isChecked } : answer
                    ),
                };
            })
        );
    };

    const addAnswerOption = (questionIndex: number) => {
        setQuestions((prev) =>
            prev.map((question, i) => {
                if (i !== questionIndex) return question;
                if (question.answerOptions.length >= 4) return question;
                return {
                    ...question,
                    answerOptions: [...question.answerOptions, { text: "", correct: false }],
                };
            })
        );
    };

    const removeAnswerOption = (questionIndex: number) => {
        setQuestions((prev) =>
            prev.map((question, i) => {
                if (i !== questionIndex) return question;
                if (question.answerOptions.length <= 1) return question;
                return {
                    ...question,
                    answerOptions: question.answerOptions.slice(0, -1),
                };
            })
        );
    };

    const removeQuestion = (indexToRemove: number) => {
        setQuestions((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const resetForm = () => {
        setQuizTitle("");
        setQuestions([createEmptyQuestion()]);
        setQuestionToDelete(null);
    };

    const handleSaveQuiz = () => {
        console.log("Quiz title:", quizTitle, "questions:", questions);
        resetForm();
        addQuizToDatabase();
        
    };

    const addQuizToDatabase = async () => {
        try {
            const response = await fetch("/api/quizzes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title: quizTitle, questions }),
            });

            if (!response.ok) {
                throw new Error("Failed to save quiz");
            }

            const result = await response.json();
            console.log("Quiz saved:", result);
            setSaveSuccess(true);
        } catch (error) {
            console.error("Error saving quiz:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <div className="w-full max-w-4xl p-6 bg-white rounded-3xl shadow-lg border border-gray-200">
                <h1 className="text-4xl font-bold mb-4">Create a Quiz Question</h1>
                <p className="text-gray-600 mb-8">
                    Add the question title and fill in answer options.
                </p>

                {!saveSuccess && (
                    <div className="mb-6 text-left bg-gray-50 rounded-3xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-3">Quiz title</h2>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={quizTitle}
                            onChange={(event) => setQuizTitle(event.target.value)}
                            placeholder="Enter the quiz title"
                            className="w-full rounded-2xl border border-gray-300 px-5 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        />
                    </div>
                )}

                {saveSuccess ? (
                    <div className="p-10 text-center">
                        <h2 className="text-3xl font-semibold mb-4 text-green-600">Quiz saved successfully!</h2>
                        <p className="text-gray-600 mb-8">Your quiz has been saved. You can create another quiz or return to the browse page.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button
                                variant="primary"
                                onClick={() => {
                                    setSaveSuccess(false);
                                }}
                            >
                                Create another quiz
                            </Button>
                            <Button onClick={() => navigate('/browse')}>Browse quizzes</Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {questions.map((question, questionIndex) => (
                            <div key={questionIndex} className="mb-6 text-left bg-gray-50 rounded-3xl border border-gray-200 p-6 shadow-sm">
                            <h2 className="text-xl font-semibold mb-3">Question {questionIndex + 1}</h2>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Question title</label>
                            <input
                                type="text"
                                value={question.questionTitle}
                                onChange={(event) => updateQuestionTitle(questionIndex, event.target.value)}
                                placeholder="Enter the quiz question"
                                className="w-full rounded-2xl border border-gray-300 px-5 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                            />

                            <div className="mt-6 flex items-center justify-between gap-4">
                                <span className="text-sm font-semibold text-gray-700">Answer options</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => removeAnswerOption(questionIndex)}
                                        disabled={question.answerOptions.length <= 1}
                                    >
                                        -
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => addAnswerOption(questionIndex)}
                                        disabled={question.answerOptions.length >= 4}
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-4 space-y-4">
                                {question.answerOptions.map((option, index) => (
                                    <div key={index} className="flex flex-col gap-3 rounded-3xl border border-gray-200 bg-white p-4">
                                        <div className="flex flex-col gap-3">
                                            <ToggleSwitch
                                                checked={option.correct}
                                                onChange={(checked) => toggleCorrectAnswer(questionIndex, index, checked)}
                                                label={`Answer option ${index + 1}`}
                                                description="Mark this answer as correct"
                                            />
                                            <input
                                                type="text"
                                                value={option.text}
                                                onChange={(event) => updateAnswerOption(questionIndex, index, event.target.value)}
                                                placeholder={`Answer option ${index + 1}`}
                                                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {!hasCorrectAnswer(questionIndex) && (
                                <p className="mt-3 text-sm text-red-600">
                                    Each question needs at least one correct answer.
                                </p>
                            )}

                            <div className="mt-4 text-right">
                                <Button
                                    variant="secondary"
                                    onClick={() => setQuestionToDelete(questionIndex)}
                                    disabled={questions.length === 1}
                                >
                                    Delete question
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {!saveSuccess && (
                    <>
                        <div className="mt-4 flex justify-center">
                            <Button onClick={addQuestion} className="px-6 py-3">
                                Add another question
                            </Button>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={() => navigate('/')}>Back to Browse</Button>
                            <Button
                                variant="primary"
                                disabled={isSubmitDisabled}
                                onClick={handleSaveQuiz}
                            >
                                Save Quiz
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <Modal
                isOpen={questionToDelete !== null}
                onClose={() => setQuestionToDelete(null)}
                title="Delete Question"
            >
                <p className="text-gray-700 mb-4">
                    Are you sure you want to delete this question? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setQuestionToDelete(null)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        className="bg-red-500 hover:bg-red-600 text-white"
                        onClick={() => {
                            if (questionToDelete !== null) {
                                removeQuestion(questionToDelete);
                            }
                            setQuestionToDelete(null);
                        }}
                    >
                        Confirm Delete
                    </Button>
                </div>
            </Modal>
        </div>
    );
}