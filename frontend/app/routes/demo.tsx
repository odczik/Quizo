// If you want a title for the page, you can export a meta function
export function meta() {
    return [{ title: "UI Components Demo" }];
}

import { Button } from '../components/Button';
import { Link } from '../components/Link';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { AnswerButton } from '../components/AnswerButton';

import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { Spinner } from '../components/Spinner';
import { ComponentShowcase } from '../components/ComponentShowcase';
import { PlayerBadge } from '../components/PlayerBadge';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { Modal } from '../components/Modal';
import { useState } from 'react';
import { useToggle } from '~/hooks/useToggle';
import { useNotification } from '~/context/NotificationContext';

export default function ComponentsDemo() {
    const [isToggleOn, setIsToggleOn] = useToggle(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { notify } = useNotification();
    
    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-12">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">UI Component Library</h1>
                    <p className="text-gray-600 mt-2">A showcase of the reusable components built for the Quizo application.</p>
                </header>

                {/* Buttons Section */}
                <ComponentShowcase title="Button.tsx">
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button variant="primary">Primary Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button variant="primary" disabled>Disabled</Button>
                    </div>
                </ComponentShowcase>

                {/* Links Section */}
                <ComponentShowcase title="Link.tsx">
                    <div className="flex flex-wrap gap-6 items-center">
                        <Link to="/demo">Standard Link</Link>
                        <Link to="/demo" variant="primary">Primary Link</Link>
                        <Link to="/demo" variant="subtle">Subtle Link</Link>
                        <Link to="/demo" variant="danger">Danger Link</Link>
                    </div>
                </ComponentShowcase>

                {/* Inputs Section */}
                <ComponentShowcase title="Input.tsx">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                        <Input 
                            label="Standard Input" 
                            placeholder="Enter something..." 
                        />
                        <Input 
                            label="Error Input" 
                            placeholder="Incorrect value" 
                            error="This field is required." 
                            defaultValue="Oops"
                        />
                        <Input 
                            label="Game PIN" 
                            placeholder="123456" 
                            type="number"
                            className="text-center font-bold tracking-widest text-lg"
                        />
                        <Input 
                            label="" 
                            placeholder="No Label"
                        />
                    </div>
                </ComponentShowcase>

                {/* Cards Section */}
                <ComponentShowcase title="Card.tsx">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Host a Quiz" className="!bg-white">
                            <p className="text-gray-600 mb-4">Start a new live session for your students.</p>
                            <Button variant="primary" className="w-full">Start Game</Button>
                        </Card>

                        <Card 
                            className="!bg-white"
                            title={
                                <div className="flex justify-between">
                                <span>Biology 101</span>
                                <Badge variant='blue'>Draft</Badge>
                                </div>
                            }
                            footer={
                                <div className="flex justify-between w-full text-sm text-gray-500">
                                <span>10 Questions</span>
                                <span>Created today</span>
                                </div>
                            }
                        >
                            <p className="text-gray-600">A test covering the basics of cell structure and photosynthesis.</p>
                        </Card>
                    </div>
                </ComponentShowcase>

                {/* Answer Buttons Section (The Kahoot Part) */}
                <ComponentShowcase title="AnswerButton.tsx" description="(The Kahoot Player/Host view)">
                    <div className="space-y-8">
                        <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Host Screen (With Text)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <AnswerButton color="red" text="Mitochondria" />
                            <AnswerButton color="blue" text="Nucleus" />
                            <AnswerButton color="yellow" text="Ribosome" />
                            <AnswerButton color="green" text="Chloroplast" />
                        </div>
                        </div>

                        <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Mobile Player Screen (Shapes Only)</h3>
                        <div className="grid grid-cols-2 gap-4 max-w-sm">
                            <AnswerButton color="red" showShapeOnly />
                            <AnswerButton color="blue" showShapeOnly />
                            <AnswerButton color="yellow" showShapeOnly />
                            <AnswerButton color="green" showShapeOnly />
                        </div>
                        </div>
                    </div>
                </ComponentShowcase>

                {/* Badges Section */}
                <ComponentShowcase title="Badge.tsx" description="(Used for tags, statuses, or bullets)">
                    <div className="flex flex-wrap gap-4 items-center">
                        <Badge variant="blue">Multiple Choice</Badge>
                        <Badge variant="green">Active</Badge>
                        <Badge variant="yellow">Double Points</Badge>
                        <Badge variant="gray">Draft</Badge>
                        <Badge variant="red">Closed</Badge>
                    </div>
                </ComponentShowcase>

                {/* Game UI Section (Progress & Spinners) */}
                <ComponentShowcase title="Game Elements" description="(ProgressBar & Spinner)">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Timers / Progress</h3>
                            <div className="space-y-4 max-w-lg">
                                <ProgressBar progress={100} color="green" height="lg" />
                                <ProgressBar progress={50} color="yellow" />
                                <ProgressBar progress={15} color="red" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Loading States</h3>
                            <div className="flex items-center gap-6">
                                <Spinner size="sm" />
                                <Spinner size="md" />
                                <Spinner size="lg" />
                                <span className="text-gray-500 flex items-center gap-2"><Spinner size="sm" /> Waiting for players...</span>
                            </div>
                        </div>
                    </div>
                </ComponentShowcase>

                {/* Toggles & Modals */}
                <ComponentShowcase title="Settings & Modals">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">ToggleSwitch.tsx</h3>
                            <div className="space-y-4 bg-gray-50 p-4 rounded border border-gray-200">
                                <ToggleSwitch 
                                    checked={isToggleOn} 
                                    onChange={setIsToggleOn} 
                                    label="Randomize Questions" 
                                    description="Mix up the order every time."
                                />
                                <ToggleSwitch 
                                    checked={true} 
                                    onChange={() => {}} 
                                    label="Friendly Nickname Generator" 
                                    description="Force players to use pre-approved names."
                                    disabled
                                />
                                <ToggleSwitch 
                                    checked={false} 
                                    onChange={() => {}} 
                                    disabled
                                    label="Pro Feature" 
                                    description="You must subscribe to use this toggle."
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Modal.tsx</h3>
                            <Button variant="primary" onClick={() => setIsModalOpen(true)}>Open Action Modal</Button>
                            
                            <Modal 
                                isOpen={isModalOpen} 
                                onClose={() => setIsModalOpen(false)}
                                title="Delete Quiz"
                                footer={
                                    <>
                                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                        <Button variant="primary" className="!bg-red-500 hover:!bg-red-600">Delete Forever</Button>
                                    </>
                                }
                            >
                                <p className="text-gray-700">Are you sure you want to delete <strong>Biology 101</strong>? This action cannot be undone and all associated questions will be destroyed.</p>
                            </Modal>
                        </div>
                    </div>
                </ComponentShowcase>

                {/* Notifications Section */}
                <ComponentShowcase title="NotificationContext.tsx" description="(Toast Notifications)">
                    <div className="flex flex-wrap gap-4">
                        <Button variant="secondary" onClick={() => notify("Here's some random info you should know.", "info")}>
                            Show Info Toast
                        </Button>
                        <Button variant="primary" className="!bg-green-500 hover:!bg-green-600" onClick={() => notify("Game saved successfully!", "success")}>
                            Show Success Toast
                        </Button>
                        <Button variant="primary" className="!bg-yellow-500 hover:!bg-yellow-600" onClick={() => notify("Warning: Internet connection unstable.", "warning")}>
                            Show Warning Toast
                        </Button>
                        <Button variant="primary" className="!bg-red-500 hover:!bg-red-600" onClick={() => notify("Error: Invalid game PIN.", "error")}>
                            Show Error Toast
                        </Button>
                    </div>
                </ComponentShowcase>

                {/* Lobby / Waiting Room UI */}
                <ComponentShowcase title="PlayerBadge.tsx" description="(The Waiting Room Lobby view)">
                    <div className="bg-gray-100 p-8 rounded border-4 border-dashed border-gray-300 min-h-[200px]">
                        <div className="flex flex-wrap gap-4 justify-center">
                            <PlayerBadge name="FastTurtle" onKick={() => alert('Kicked!')} />
                            <PlayerBadge name="CleverFox" onKick={() => alert('Kicked!')} />
                            <PlayerBadge name="John_Doe123" onKick={() => alert('Kicked!')} />
                            <PlayerBadge name="SleepyBear" />
                            <PlayerBadge name="SneakySnake" />
                        </div>
                    </div>
                </ComponentShowcase>
            </div>
        </div>
    );
}
