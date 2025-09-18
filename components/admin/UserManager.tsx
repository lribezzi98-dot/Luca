
import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { Role } from '../../types';
import Spinner from '../common/Spinner';
import Button from '../common/Button';

const UserManager: React.FC = () => {
    const { users, updateUserRole, currentUser, loading } = useContext(AppContext);

    const handleRoleChange = async (userId: string, currentRole: Role) => {
        const newRole = currentRole === Role.ADMIN ? Role.USER : Role.ADMIN;
        if(window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)){
            await updateUserRole(userId, newRole);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Users</h2>
            <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-300">Name</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Email</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Phone</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Role</th>
                                <th className="p-4 text-sm font-semibold text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.sort((a,b) => a.lastName.localeCompare(b.lastName)).map(user => (
                                <tr key={user.id} className="border-b border-slate-700 last:border-0">
                                    <td className="p-4">{user.firstName} {user.lastName}</td>
                                    <td className="p-4 text-slate-300">{user.email}</td>
                                    <td className="p-4 text-slate-300">{user.phone}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === Role.ADMIN ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-600 text-slate-300'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {currentUser?.id !== user.id && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleRoleChange(user.id, user.role)}
                                            >
                                                {user.role === Role.ADMIN ? 'Revoke Admin' : 'Make Admin'}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManager;
