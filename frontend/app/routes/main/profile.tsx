import { useState, useEffect } from "react";
import { useAuth } from "~/context/AuthenticationContext";
import { useNotification } from "~/context/NotificationContext";
import api from "~/utils/api";

import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { Card } from "~/components/Card";
import { Modal } from "~/components/Modal";
import { useNavigate } from "react-router";

export default function Profile() {
    const { user, checkAuth, logout } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.apiClient("/api/user/profile", {
                method: "PUT",
                body: JSON.stringify({ name, email })
            });

            if (res.ok) {
                notify("Profile updated successfully!", "success");
                checkAuth();
            } else {
                const data = await res.json();
                throw new Error(data.message || "Failed to update profile.");
            }
        } catch (error: any) {
            notify(error.message, "error");
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.apiClient("/api/user/password", {
                method: "PUT",
                body: JSON.stringify({
                    current_password: currentPassword,
                    password: newPassword,
                    password_confirmation: newPasswordConfirmation
                })
            });

            if (res.ok) {
                notify("Password updated successfully!", "success");
                setCurrentPassword("");
                setNewPassword("");
                setNewPasswordConfirmation("");
            } else {
                const data = await res.json();
                throw new Error(data.message || "Failed to update password.");
            }
        } catch (error: any) {
            notify(error.message, "error");
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const res = await api.apiClient("/api/user/profile", {
                method: "DELETE",
                body: JSON.stringify({ password: deletePassword })
            });

            if (res.ok) {
                notify("Account deleted successfully.", "success");
                setIsDeleteModalOpen(false);
                logout();
                navigate("/");
            } else {
                const data = await res.json();
                throw new Error(data.message || "Failed to delete account. Ensure your password is correct.");
            }
        } catch (error: any) {
            notify(error.message, "error");
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold mb-6">User Profile</h1>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <Input 
                        label="Name" 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                    <Input 
                        label="Email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <Button 
                        type="submit" 
                        variant="primary"
                        disabled={name === user?.name && email === user?.email}
                    >
                        Save Changes
                    </Button>
                </form>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <Input 
                        label="Current Password" 
                        type="password" 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                        required 
                    />
                    <Input 
                        label="New Password" 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                    />
                    <Input 
                        label="Confirm New Password" 
                        type="password" 
                        value={newPasswordConfirmation} 
                        onChange={(e) => setNewPasswordConfirmation(e.target.value)} 
                        required 
                    />
                    <Button 
                        type="submit" 
                        variant="primary"
                        disabled={!currentPassword || !newPassword || !newPasswordConfirmation}
                    >
                        Update Password
                    </Button>
                </form>
            </Card>

            <Card className="p-6 border-red-200">
                <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
                <p className="text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <Button 
                    variant="secondary" 
                    className="bg-red-500 hover:bg-red-600 text-white" 
                    onClick={() => setIsDeleteModalOpen(true)}
                >
                    Delete Account
                </Button>
            </Card>

            <Modal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                title="Delete Account"
            >
                <p className="mb-4 text-gray-700">Are you sure you want to delete your account? Enter your password to confirm.</p>
                <Input 
                    label="Password" 
                    type="password" 
                    value={deletePassword} 
                    onChange={(e) => setDeletePassword(e.target.value)} 
                />
                <div className="mt-6 flex justify-end gap-4">
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                    <Button 
                        variant="secondary" 
                        className="bg-red-500 hover:bg-red-600 text-white" 
                        onClick={handleDeleteAccount}
                        disabled={!deletePassword}
                    >
                        Confirm Deletion
                    </Button>
                </div>
            </Modal>
        </div>
    );
}