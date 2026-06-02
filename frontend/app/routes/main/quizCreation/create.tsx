import { Button } from "~/components/Button";
import { Modal } from "~/components/Modal";
import { ToggleSwitch } from "~/components/ToggleSwitch";
import { useState } from "react";
import { useNavigate } from "react-router";
import { apiClient } from "~/utils/api";

export default function CreateQuiz() {
    const navigate = useNavigate();
    const [quizTitle, setQuizTitle] = useState("");
    const [quizImage, setQuizImage] = useState<string | null>(null);
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublic, setIsPublic] = useState(true);
    const [saveError, setSaveError] = useState<string | null>(null);

    const createEmptyQuestion = (type: "multiple_choice" | "fill_in_blank" = "multiple_choice") => ({
        questionTitle: "",
        type,
        timeLimit: 20,
        answerOptions:
            type === "multiple_choice"
                ? [
                      { text: "", correct: false },
                      { text: "", correct: false },
                      { text: "", correct: false },
                      { text: "", correct: false },
                  ]
                : [{ text: "", correct: true }],
    });

    const [questions, setQuestions] = useState([createEmptyQuestion()]);

    const isSubmitDisabled =
        !quizTitle.trim() ||
        questions.some((question) => {
            if (!question.questionTitle.trim()) return true;
            if (question.timeLimit === undefined || question.timeLimit < 0) return true;
            if (question.type === "fill_in_blank") {
                return !question.answerOptions[0]?.text.trim();
            }
            return (
                question.answerOptions.some((option) => !option.text.trim()) ||
                !question.answerOptions.some((option) => option.correct)
            );
        });

    const hasCorrectAnswer = (questionIndex: number) =>
        questions[questionIndex].answerOptions.some((option) => option.correct);

    const addQuestion = () => {
        setQuestions((prev) => [...prev, createEmptyQuestion("multiple_choice")]);
    };

    const updateQuestionTitle = (index: number, value: string) => {
        setQuestions((prev) =>
            prev.map((question, i) => (i === index ? { ...question, questionTitle: value } : question))
        );
    };

    const updateQuestionTimeLimit = (index: number, value: number) => {
        setQuestions((prev) =>
            prev.map((question, i) =>
                i === index ? { ...question, timeLimit: value } : question
            )
        );
    };

    const updateQuestionType = (index: number, newType: "multiple_choice" | "fill_in_blank") => {
        setQuestions((prev) =>
            prev.map((question, i) => {
                if (i !== index) return question;
                if (question.type === newType) return question;
                return {
                    ...question,
                    type: newType,
                    answerOptions:
                        newType === "multiple_choice"
                            ? [
                                  { text: "", correct: false },
                                  { text: "", correct: false },
                                  { text: "", correct: false },
                                  { text: "", correct: false },
                              ]
                            : [{ text: "", correct: true }],
                };
            })
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

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQuizImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setQuizTitle("");
        setQuizImage(null);
        setQuestions([createEmptyQuestion()]);
        setQuestionToDelete(null);
        setIsPublic(true);
    };

    const handleSaveQuiz = () => {
        console.log("Quiz title:", quizTitle, "questions:", questions);
        addQuizToDatabase();
    };

    const dataURLToBlob = (dataURL: string) => {
        const [meta, base64] = dataURL.split(',');
        const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
        const binary = atob(base64);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
        return new Blob([array], { type: mime });
    };

    const addQuizToDatabase = async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
            let response: Response;

            // If we have a data URL image, send as multipart/form-data (file upload)
            if (quizImage && quizImage.startsWith("data:")) {
                const form = new FormData();
                form.append("title", quizTitle);
                form.append("questions", JSON.stringify(questions));
                // Send as 1 or 0 for boolean in form data
                form.append("is_public", isPublic ? "1" : "0");
                const blob = dataURLToBlob(quizImage);
                form.append("image", blob, "quiz-image.png");

                response = await fetch("/api/quizzes", {
                    method: "POST",
                    body: form,
                });
            } else {
                // No image or already a URL - send JSON
                response = await apiClient("/api/quizzes", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ title: quizTitle, questions, image: quizImage, is_public: isPublic }),
                });
            }

            const contentType = response.headers.get("content-type") || "";
            const body = contentType.includes("application/json")
                ? await response.json().catch(() => null)
                : await response.text().catch(() => null);

            if (!response.ok) {
                console.error("Save failed response:", response.status, body);
                setSaveError(body?.message || `Failed to save quiz (status ${response.status})`);
                return;
            }

            console.log("Quiz saved:", body);
            setSaveSuccess(true);
            resetForm();
        } catch (error) {
            console.error("Error saving quiz:", error);
            setSaveError(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setIsSaving(false);
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

                        <div className="mt-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Quiz Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="mt-2 text-sm text-gray-500">This image will be displayed when browsing quizzes</p>
                        </div>

                        {quizImage && (
                            <div className="mt-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Image Preview</label>
                                <img
                                    src={quizImage}
                                    alt="Quiz preview"
                                    className="w-full max-w-sm h-auto rounded-2xl border border-gray-300 object-cover"
                                />
                                <button
                                    onClick={() => setQuizImage(null)}
                                    className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
                                >
                                    Remove image
                                </button>
                            </div>
                        )}
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

                            <div className="mt-6 grid gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type</label>
                                    <select
                                        value={question.type}
                                        onChange={(event) => updateQuestionType(questionIndex, event.target.value as "multiple_choice" | "fill_in_blank")}
                                        className="w-full rounded-2xl border border-gray-300 px-5 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                    >
                                        <option value="multiple_choice">Multiple Choice (4 answers)</option>
                                        <option value="fill_in_blank">Fill in the Blank</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time to answer (seconds)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={question.timeLimit}
                                        onChange={(event) => updateQuestionTimeLimit(questionIndex, Number(event.target.value))}
                                        className="w-full rounded-2xl border border-gray-300 px-5 py-4 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                    />
                                </div>
                            </div>

                            {question.type === "multiple_choice" && (
                                <>
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
                                </>
                            )}

                            {question.type === "fill_in_blank" && (
                                <>
                                    <div className="mt-6">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Correct Answer</label>
                                        <input
                                            type="text"
                                            value={question.answerOptions[0]?.text || ""}
                                            onChange={(event) => updateAnswerOption(questionIndex, 0, event.target.value)}
                                            placeholder="Enter the correct answer"
                                            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                        />
                                        <p className="mt-2 text-sm text-gray-500">Players will type their answer, which will be compared with this exact text.</p>
                                    </div>
                                </>
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

                        <div className="mt-6 flex justify-center">
                            <div className="flex flex-col items-center rounded-3xl border border-gray-200 bg-white px-6 py-6 shadow-sm text-center max-w-xl w-full">
                                <ToggleSwitch
                                    checked={isPublic}
                                    onChange={setIsPublic}
                                />
                                <div className="mt-4">
                                    <p className="text-sm font-semibold text-gray-900">Make this quiz public</p>
                                    <p className="text-sm text-gray-500 mt-1">Anyone can find and play this quiz when it is public.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <Button onClick={() => navigate('/')}>Back to Browse</Button>
                            <Button
                                variant="primary"
                                disabled={isSubmitDisabled || isSaving}
                                onClick={handleSaveQuiz}
                            >
                                {isSaving ? 'Saving...' : 'Save Quiz'}
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