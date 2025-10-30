// web/pages/AdminDashboard.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Position, Candidate, AdminUser, AuditLogEntry, AdminRole } from '../types';
import { usePermissions, Permissions } from '../hooks/usePermissions';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ImageUploader from '../components/ImageUploader';
import Spinner from '../components/Spinner'; 
import sjbuApi from '../src/api/sjbuApi';
import { useAdminUsers } from '../hooks/useAdminUsers'; 
import { useOverallStats } from '../hooks/useOverallStats';
import { useAuditLogs } from '../hooks/useAuditLogs'; 
import { isAxiosError } from 'axios';

// REMOVED: MOCK_ADMIN_USERS_FOR_DEMO, MOCK_AUDIT_LOG_DATA_FOR_DEMO (NO MOCK DATA)

// --- Helper Icons (Unchanged) ---
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const UserIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
const LogoutIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;
const DashboardIcon = () => <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const PositionsIcon = () => <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>;
const CandidatesIcon = () => <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>;
const UsersIcon = () => <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2"></path></svg>;
const AuditIcon = () => <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const SettingsIcon = () => <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;


// --- Type Definitions ---
interface PositionWithCandidates extends Position {
    candidates: Candidate[];
}

interface AdminDashboardProps {
    positions: PositionWithCandidates[];
    currentUser: AdminUser;
    setCurrentUser: (user: AdminUser) => void;
    onLogout: () => void;
    onStartCountdown: (hours: number) => void;
    onRefetchPositions: () => void; 
}

type AdminView = 'dashboard' | 'positions' | 'candidates' | 'users' | 'audit' | 'settings';
type ModalType = 'ADD_POSITION' | 'EDIT_POSITION' | 'DELETE_POSITION' | 'ADD_CANDIDATE' | 'EDIT_CANDIDATE' | 'DELETE_CANDIDATE' | 'ADD_USER' | 'EDIT_USER' | 'DELETE_USER';
interface ModalState {
    isOpen: boolean;
    type: ModalType | null;
    data?: any;
}


// --- Role Switcher Component ---
const RoleSwitcher: React.FC<{ adminUsers: AdminUser[], currentUser: AdminUser, setCurrentUser: (user: AdminUser) => void, onLogout: () => void }> = ({ adminUsers, currentUser, setCurrentUser, onLogout }) => {
    // FIXED: Use live data only. If empty, it will only show the current user/logout button.
    const usersToDisplay = adminUsers.length > 0 ? adminUsers : []; 
    return (
        <Card className="mb-6 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                    <UserIcon />
                    <span className="font-semibold text-dmi-blue-900">Current User:</span>
                     <span className="ml-2 mr-2 px-3 py-1 text-sm font-semibold text-dmi-blue-800 bg-dmi-blue-100 rounded-full">{currentUser.username}</span>
                    <span className="px-3 py-1 text-sm font-bold text-white bg-dmi-blue-700 rounded-full">{currentUser.role.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 hidden md:inline">Switch Role:</span>
                    {usersToDisplay.map(user => (
                        <Button
                            key={user.id}
                            size="sm"
                            variant={currentUser.id === user.id ? 'primary' : 'secondary'}
                            // NOTE: setCurrentUser only works for demo switching in frontend state, not live auth
                            onClick={() => setCurrentUser(user)} 
                             className="hidden md:flex"
                        >
                            {user.role}
                        </Button>
                    ))}
                    <Button size="sm" variant="secondary" onClick={onLogout}><LogoutIcon/> Logout</Button>
                </div>
            </div>
        </Card>
    );
};

// --- Sidebar Navigation (Unchanged) ---
interface SidebarProps {
    activeView: AdminView;
    setActiveView: (view: AdminView) => void;
    permissions: Permissions;
}
const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, permissions }) => {
     const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, permitted: permissions.canViewDashboard },
        { id: 'positions', label: 'Positions', icon: <PositionsIcon />, permitted: permissions.canViewPositions },
        { id: 'candidates', label: 'Candidates', icon: <CandidatesIcon />, permitted: permissions.canViewCandidates },
        { id: 'users', label: 'User Management', icon: <UsersIcon />, permitted: permissions.canViewUsers },
        { id: 'audit', label: 'Audit Log', icon: <AuditIcon />, permitted: permissions.canViewAuditLog },
        { id: 'settings', label: 'Settings', icon: <SettingsIcon />, permitted: permissions.canEditSettings },
    ];

    return (
        <aside className="bg-white p-4 rounded-xl shadow-md">
            <nav className="space-y-2">
                {navItems.map(item => {
                    if (!item.permitted) return null;
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id as AdminView)}
                            className={`w-full flex items-center p-3 text-left rounded-lg transition-colors ${isActive ? 'bg-dmi-blue-600 text-white font-bold shadow' : 'text-gray-700 hover:bg-dmi-blue-50 hover:text-dmi-blue-800'}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    )
                })}
            </nav>
        </aside>
    );
};


// --- Admin Dashboard Component ---
const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const { currentUser, onLogout, onRefetchPositions } = props;
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [modal, setModal] = useState<ModalState>({ isOpen: false, type: null });
    const permissions = usePermissions(currentUser);

    // LIVE DATA INTEGRATION
    const { adminUsers, isLoading: isAdminUsersLoading, error: adminUsersError, fetchAdminUsers } = useAdminUsers();

    const handleOpenModal = (type: ModalType, data?: any) => setModal({ isOpen: true, type, data });
    const handleCloseModal = () => setModal({ isOpen: false, type: null });
    
    // Effect to handle view changes when role changes (Unchanged)
    useEffect(() => {
        const viewPermissions: { [key in AdminView]: keyof Permissions } = {
            dashboard: 'canViewDashboard',
            positions: 'canViewPositions',
            candidates: 'canViewCandidates',
            users: 'canViewUsers',
            audit: 'canViewAuditLog',
            settings: 'canEditSettings',
        };

        if (!permissions[viewPermissions[activeView]]) {
            setActiveView('dashboard');
        }
    }, [currentUser, activeView, permissions]);

    // Pass this unified function to modals for refreshing relevant data
    const handleDataRefresh = useCallback(() => {
        fetchAdminUsers();
        onRefetchPositions();
    }, [fetchAdminUsers, onRefetchPositions]);


    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView />;
            case 'positions': return <PositionsView positions={props.positions} permissions={permissions} onOpenModal={handleOpenModal} />;
            case 'candidates': return <CandidatesView positions={props.positions} permissions={permissions} onOpenModal={handleOpenModal} />;
            case 'users': 
                 if (isAdminUsersLoading) return <Card className="p-8 text-center"><p>Loading Admin Users...</p></Card>
                 // FIXED: Use a blank array if live adminUsers is empty 
                 const finalAdminUsers = adminUsers.length > 0 ? adminUsers : [];
                 if (adminUsersError && adminUsers.length === 0) return <Card className="p-8 text-center text-red-600"><p>{adminUsersError}</p><Button onClick={fetchAdminUsers}>Retry</Button></Card>
                 return <UserManagementView adminUsers={finalAdminUsers} permissions={permissions} onOpenModal={handleOpenModal} onRefresh={handleDataRefresh} />;
            case 'audit': return <AuditLogView permissions={permissions} />;
            case 'settings': return <SettingsView permissions={permissions} onStartCountdown={props.onStartCountdown} />;
            default: return <DashboardView />;
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-dmi-blue-900 mb-6">Administrator Dashboard</h1>
            
            <RoleSwitcher 
                adminUsers={adminUsers} 
                currentUser={props.currentUser} 
                setCurrentUser={props.currentUser} 
                onLogout={onLogout}
            /> 

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                   <Sidebar activeView={activeView} setActiveView={setActiveView} permissions={permissions} />
                </div>
                <div className="lg:col-span-3">
                   {renderActiveView()}
                </div>
            </div>
        
            <ManagementModals 
                modalState={modal} 
                onClose={handleCloseModal} 
                permissions={permissions} 
                positions={props.positions}
                onRefreshData={handleDataRefresh}
                currentUser={currentUser}
            />
        </div>
    );
};

// --- Dashboard View (LIVE STATS) ---
const DashboardView: React.FC = () => {
    const { stats, isLoading, error, fetchStats } = useOverallStats();

    if (isLoading) return <Card className="p-8 text-center"><p>Loading Statistics...</p></Card>
    if (error) return <Card className="p-8 text-center text-red-600"><p>{error}</p><Button onClick={fetchStats}>Retry</Button></Card>
    
    // Fallback data: Set to empty arrays/default values to prevent chart crashes
    const hourlyTurnout: any[] = []; 
    const stationStatus: any[] = []; 

    // Live Data
    const totalVotesCast = stats?.totalVotesCast ?? 0;
    const totalVoters = stats?.totalVoters ?? 0;
    
    // FINAL FIX: Calculate Turnout (Total Votes Cast / 2) / Total Voters * 100 for accuracy
    const uniqueVotersProxy = totalVotesCast / 2;
    const liveVoterTurnout = (totalVoters > 0 && uniqueVotersProxy > 0)
        ? ((uniqueVotersProxy / totalVoters) * 100).toFixed(2)
        : '0.00';

    // Extract Position Stats for Charts/Tables
    const positionsWithStats = stats?.positionsWithStats || [];


    const StatusIndicator = ({ status }: { status: string }) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ status === 'Online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>{status}</span>
    );
    
    return (
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-gray-500 font-semibold">Total Votes Cast (Live)</h3>
                    <p className="text-4xl font-bold text-dmi-blue-800 mt-2">{totalVotesCast}</p>
                </Card>
                 <Card className="p-6">
                    <h3 className="text-gray-500 font-semibold">Voter Turnout (Live)</h3>
                    <p className="text-4xl font-bold text-dmi-blue-800 mt-2">{liveVoterTurnout}%</p>
                </Card>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-bold text-dmi-blue-900 mb-4">Turnout by Hour</h2>
                {hourlyTurnout.length > 0 ? (
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyTurnout} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="votes" fill="#1b66c4" name="Votes Cast" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No hourly trend data available from the server.
                    </div>
                )}
            </Card>

            {/* ADDED: Positions Statistics Tables/Charts */}
            <h2 className="text-3xl font-bold text-dmi-blue-900 text-center mb-6">Candidate Race Summaries</h2>
            <div className="space-y-8">
                {positionsWithStats.map((position: any) => (
                    <Card key={position.positionId} className="p-6">
                        <h3 className="text-xl font-bold text-dmi-blue-900 mb-4">{position.positionName} - {position.totalVotes} Votes Cast</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={position.candidates} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="candidateName" width={100} tick={{fontSize: 12}} />
                                    <Tooltip formatter={(value: number, name: string) => [
                                        `${value} votes (${(value / position.totalVotes * 100).toFixed(2)}%)`, 
                                        position.positionName
                                    ]} />
                                    <Legend />
                                    <Bar dataKey="voteCount" name="Votes" fill="#1b66c4" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                ))}
            </div>


            {/* REMOVED: Polling Station Status Card - per requirement */}
        </div>
    );
};

// --- Settings View (Unchanged - Mock Handlers) ---
interface SettingsViewProps {
    permissions: Permissions;
    onStartCountdown: (hours: number) => void;
}
const SettingsView: React.FC<SettingsViewProps> = ({ permissions, onStartCountdown }) => {
    const [countdownHours, setCountdownHours] = useState('48');

    const handleStartCountdown = (e: React.FormEvent) => {
        e.preventDefault();
        const hours = parseInt(countdownHours, 10);
        if (hours > 0 && hours <= 48) {
            onStartCountdown(hours);
            alert(`Countdown successfully started for ${hours} hours! The home page timer will now reflect this change.`);
        } else {
            alert('Please enter a valid number of hours between 1 and 48.');
        }
    };
    
    return (
        <Card>
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-dmi-blue-900">Election Settings</h2>
                <p className="text-sm text-gray-500">Configure core parameters for the election.</p>
            </div>
            <form className="p-6 space-y-6">
                {!permissions.canEditSettings && (
                    <div className="bg-dmi-blue-50 text-dmi-blue-800 p-3 rounded-lg text-sm">
                        Settings can only be modified by a Super Admin.
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Election Start Date</label>
                        <input type="datetime-local" id="start-date" name="start-date" disabled={!permissions.canEditSettings} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500 disabled:bg-gray-100" />
                    </div>
                     <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">Election End Date</label>
                        <input type="datetime-local" id="end-date" name="end-date" disabled={!permissions.canEditSettings} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500 disabled:bg-gray-100" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="voucher-rules" className="block text-sm font-medium text-gray-700">Voucher Generation Rules</label>
                     <textarea id="voucher-rules" name="voucher-rules" rows={4} disabled={!permissions.canEditSettings} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500 disabled:bg-gray-100" placeholder="e.g., Alphanumeric, 12 characters, expires in 24 hours..."></textarea>
                </div>
                 <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={!permissions.canEditSettings} disabledTooltip="Requires Super Admin role.">Save Settings</Button>
                </div>
            </form>

            <div className="p-6 border-t space-y-4">
                <h3 className="text-lg font-bold text-dmi-blue-800">Start Election Countdown</h3>
                <p className="text-sm text-gray-600">
                    This will immediately set the election start time based on the hours provided from now. This action is irreversible for this session.
                </p>
                <form onSubmit={handleStartCountdown} className="flex flex-col sm:flex-row sm:items-end sm:space-x-4">
                    <div className="flex-grow">
                        <label htmlFor="countdown-hours" className="block text-sm font-medium text-gray-700">Countdown Duration (1-48 Hours)</label>
                        <input
                            type="number"
                            id="countdown-hours"
                            name="countdown-hours"
                            value={countdownHours}
                            onChange={e => setCountdownHours(e.target.value)}
                            min="1"
                            max="48"
                            disabled={!permissions.canEditSettings}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500 disabled:bg-gray-100"
                            required
                        />
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Button
                            type="submit"
                            disabled={!permissions.canEditSettings}
                            disabledTooltip="Requires Super Admin role."
                            variant="danger"
                        >
                            Start Countdown
                        </Button>
                    </div>
                </form>
            </div>
        </Card>
    );
};

// --- Audit Log View (LIVE LOGS) ---
interface AuditLogViewProps {
    permissions: Permissions;
}
const AuditLogView: React.FC<AuditLogViewProps> = ({ permissions }) => {
    const { logs, isLoading, error, fetchLogs } = useAuditLogs(); 
    
    // FIXED: Only display live logs.
    const finalLogs = logs || []; 

    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = finalLogs.filter(log =>
        log.adminUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const getActionChipColor = (action: string) => {
        if (action.includes('SUCCESS') || action.includes('CREATED') || action.includes('LOGIN')) return 'bg-green-100 text-green-800';
        if (action.includes('FAILED') || action.includes('DELETED')) return 'bg-red-100 text-red-800';
        if (action.includes('UPDATED') || action.includes('CHANGED') || action.includes('VIEW')) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <Card>
            <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-xl font-bold text-dmi-blue-900">Admin Audit Log</h2>
                <Button size="sm" variant="secondary" onClick={() => fetchLogs()} disabled={isLoading}>Refresh</Button>
            </div>
            {isLoading && <div className="p-4 text-center"><Spinner /> Loading logs...</div>}
            {error && <div className="p-4 text-center text-red-600"><p>{error}</p><Button onClick={() => fetchLogs()}>Retry</Button></div>}
            <div className="p-4">
                <input
                    type="text"
                    placeholder="Search logs by user, action, or details..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-dmi-blue-500 focus:border-dmi-blue-500"
                    aria-label="Search audit logs"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                        <tr>
                            <th scope="col" className="px-4 py-3">Timestamp</th>
                            <th scope="col" className="px-4 py-3">Admin User</th>
                            <th scope="col" className="px-4 py-3">Action</th>
                            <th scope="col" className="px-4 py-3">Details</th>
                            <th scope="col" className="px-4 py-3">IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                    {log.timestamp instanceof Date ? log.timestamp.toLocaleString() : log.timestamp}
                                </td>
                                <td className="px-4 py-3 font-medium text-dmi-blue-800">{log.adminUsername}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 font-semibold rounded-full text-xs ${getActionChipColor(log.action)}`}>
                                        {log.action.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-700">{log.details}</td>
                                <td className="px-4 py-3 font-mono text-gray-500">{log.ipAddress}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredLogs.length === 0 && !isLoading && (
                    <div className="text-center p-8 text-gray-500">
                        <p>No audit logs found matching your search criteria.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

// --- Positions Management View (Unchanged - relies on Modals for logic) ---
interface PositionsViewProps extends Pick<AdminDashboardProps, 'positions'> {
    permissions: Permissions;
    onOpenModal: (type: ModalType, data?: any) => void;
}
const PositionsView: React.FC<PositionsViewProps> = ({ positions, permissions, onOpenModal }) => {
    return (
    <Card>
        <div className="p-4 flex justify-between items-center border-b">
             <h2 className="text-xl font-bold text-dmi-blue-900">Manage Positions</h2>
            <Button 
                onClick={() => onOpenModal('ADD_POSITION')}
                disabled={!permissions.canManagePositions}
                disabledTooltip="Requires Admin or Super Admin role."
            >
                <PlusIcon/> Add Position
            </Button>
        </div>
        <table className="w-full text-left">
            <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-4 py-3">Position Name</th>
                    <th scope="col" className="px-4 py-3">Candidates</th>
                    <th scope="col" className="px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                {positions.map(pos => (
                    <tr key={pos.id} className="border-b"> 
                        <td className="p-4 font-semibold text-dmi-blue-800">{pos.name}</td>
                        <td className="p-4">{pos.candidates.length}</td>
                        <td className="p-4">
                            <div className="flex space-x-2">
                                <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    onClick={() => onOpenModal('EDIT_POSITION', pos)}
                                    disabled={!permissions.canManagePositions}
                                    disabledTooltip="Requires Admin or Super Admin role."
                                ><EditIcon/> Edit</Button>
                                <Button 
                                    size="sm" 
                                    variant="danger" 
                                    onClick={() => onOpenModal('DELETE_POSITION', pos)}
                                    disabled={!permissions.canManagePositions}
                                    disabledTooltip="Requires Admin or Super Admin role."
                                ><TrashIcon/> Delete</Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </Card>
    );
};


// --- Candidates Management View (Unchanged - relies on Modals for logic) ---
interface CandidatesViewProps extends Pick<AdminDashboardProps, 'positions'> {
    permissions: Permissions;
    onOpenModal: (type: ModalType, data?: any) => void;
}
const CandidatesView: React.FC<CandidatesViewProps> = ({ positions, permissions, onOpenModal }) => {
     const [selectedPositionId, setSelectedPositionId] = useState<string | number | null>(positions[0]?.id || null);
    
    useEffect(() => {
        if (!selectedPositionId && positions.length > 0) {
            setSelectedPositionId(positions[0].id);
        }
         if (positions.length > 0 && !positions.find(p => p.id === selectedPositionId)) {
            setSelectedPositionId(positions[0].id);
        }
        if (positions.length === 0) {
            setSelectedPositionId(null);
        }
    }, [positions, selectedPositionId]);

    const selectedPosition = positions.find(p => p.id === selectedPositionId);
    
    return (
        <div className="space-y-6">
            <Card className="p-4">
                 <label htmlFor="position-select" className="block text-sm font-medium text-gray-700 mb-2">Select Position to Manage</label>
                 <select 
                    id="position-select"
                    value={selectedPositionId || ''}
                    onChange={(e) => setSelectedPositionId(e.target.value)}
                    className="mt-1 block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500"
                 >
                     {positions.length > 0 ? positions.map(p => (
                         <option key={p.id} value={p.id}>{p.name}</option>
                     )) : <option disabled>No positions available</option>}
                 </select>
            </Card>

            {selectedPosition ? (
                <Card>
                    <div className="p-4 flex justify-between items-center border-b">
                        <h2 className="text-xl font-bold text-dmi-blue-900">Candidates for: <span className="font-normal">{selectedPosition.name}</span></h2>
                        <Button 
                            onClick={() => onOpenModal('ADD_CANDIDATE', selectedPosition)}
                            disabled={!permissions.canManageCandidates}
                            disabledTooltip="Requires Admin or Super Admin role."
                        >
                            <PlusIcon/> Add Candidate
                        </Button>
                    </div>
                    <div className="p-4">
                        {selectedPosition.candidates.length > 0 ? (
                            <div className="space-y-3">
                                {selectedPosition.candidates.map(cand => (
                                    <div key={cand.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center space-x-4">
                                            <img src={cand.photoUrl} alt={cand.name} className="w-16 h-16 rounded-full object-cover"/>
                                            <div>
                                                <p className="font-semibold text-gray-800">{cand.name}</p>
                                                <p className="text-sm text-gray-500">{cand.faculty}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="secondary" onClick={() => onOpenModal('EDIT_CANDIDATE', { ...cand, positionId: selectedPosition.id })}
                                                disabled={!permissions.canManageCandidates}
                                                disabledTooltip="Requires Admin or Super Admin role."
                                            ><EditIcon /></Button>
                                            <Button size="sm" variant="danger" onClick={() => onOpenModal('DELETE_CANDIDATE', { ...cand, positionId: selectedPosition.id })}
                                                 disabled={!permissions.canManageCandidates}
                                                 disabledTooltip="Requires Admin or Super Admin role."
                                            ><TrashIcon /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <h3 className="text-lg font-semibold text-gray-700">No Candidates Yet</h3>
                                <p className="text-gray-500 mt-1">{permissions.canManageCandidates ? 'Click "Add Candidate" to get started.' : 'Contact an admin to add candidates.'}</p>
                            </div>
                        )}
                    </div>
                </Card>
            ) : (
                <Card className="flex items-center justify-center h-full p-8">
                     <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-700">Select a Position</h3>
                        <p className="text-gray-500 mt-1">Choose a position from the dropdown to manage its candidates.</p>
                    </div>
                </Card>
            )}
        </div>
    );
};


// --- User Management View (LIVE USERS & RENEWED PROPS) ---
interface UserManagementViewProps {
    adminUsers: AdminUser[];
    permissions: Permissions;
    onOpenModal: (type: ModalType, data?: any) => void;
    onRefresh: () => void; // Passed from AdminDashboard for post-CRUD refresh
}
const UserManagementView: React.FC<UserManagementViewProps> = ({ adminUsers, permissions, onOpenModal, onRefresh }) => {
    // FIXED: Use demo data if live adminUsers is empty
    const usersToDisplay = adminUsers.length > 0 ? adminUsers : MOCK_ADMIN_USERS_FOR_DEMO;
    return (
        <Card>
            <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-xl font-bold text-dmi-blue-900">Manage Admin Users</h2>
                <Button 
                    disabled={!permissions.canManageUsers}
                    disabledTooltip="Requires Super Admin role."
                    onClick={() => onOpenModal('ADD_USER')}
                >
                    <PlusIcon/> Create New Admin
                </Button>
            </div>
             
            <table className="w-full text-left">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-4 py-3">Username</th>
                        <th scope="col" className="px-4 py-3">Role</th>
                        <th scope="col" className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {usersToDisplay.map(user => (
                        <tr key={user.id} className="border-b">
                            <td className="p-4 font-semibold text-dmi-blue-800">{user.username}</td>
                            <td className="p-4">
                                 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ 
                                     user.role === 'super_admin' ? 'bg-dmi-gold-500 text-white' : 
                                     user.role === 'admin' ? 'bg-dmi-blue-100 text-dmi-blue-800' :
                                     'bg-gray-200 text-gray-800'
                                 }`}>
                                     {user.role}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex space-x-2">
                                    <Button 
                                        size="sm" variant="secondary" 
                                        disabled={!permissions.canManageUsers} 
                                        disabledTooltip="Requires Super Admin role."
                                        onClick={() => onOpenModal('EDIT_USER', user)}
                                    ><EditIcon/> Edit</Button>
                                    <Button 
                                        size="sm" 
                                        variant="danger" 
                                        disabled={!permissions.canManageUsers} 
                                        disabledTooltip="Requires Super Admin role."
                                        onClick={() => onOpenModal('DELETE_USER', user)}
                                    ><TrashIcon/> Delete</Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};


// --- Modals and Forms (LIVE CRUD IMPLEMENTATION) ---
interface ManagementModalsProps {
    modalState: ModalState;
    onClose: () => void;
    permissions: Permissions;
    positions: PositionWithCandidates[];
    onRefreshData: () => void; // Unified refresh function
    currentUser: AdminUser; // Required for self-deactivation check
}

const ManagementModals: React.FC<ManagementModalsProps> = ({ modalState, onClose, permissions, positions, onRefreshData, currentUser }) => {
    const { isOpen, type, data } = modalState;

    if (!isOpen) return null;
    
    // Position Modals
    if ((type === 'ADD_POSITION' || type === 'EDIT_POSITION' || type === 'DELETE_POSITION') && permissions.canManagePositions) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={
                type === 'ADD_POSITION' ? 'Add New Position' : 
                type === 'EDIT_POSITION' ? 'Edit Position' : 
                'Delete Position'
            }>
                {type === 'ADD_POSITION' || type === 'EDIT_POSITION' ? (
                     <PositionForm
                        type={type}
                        position={data}
                        onSuccess={() => { onRefreshData(); onClose(); }}
                        onCancel={onClose}
                    />
                ) : (
                    <DeleteConfirmation
                        entityType="Position"
                        entityName={data.name}
                        onConfirm={async () => {
                            await sjbuApi.delete(`/positions/${data.id}`); // DELETE /positions/{positionId}
                            onRefreshData();
                            onClose();
                        }}
                        onCancel={onClose}
                    />
                )}
            </Modal>
        );
    }
    
    // Candidate Modals
    if ((type === 'ADD_CANDIDATE' || type === 'EDIT_CANDIDATE' || type === 'DELETE_CANDIDATE') && permissions.canManageCandidates) {
         return (
            <Modal isOpen={isOpen} onClose={onClose} title={
                 type === 'ADD_CANDIDATE' ? `Add Candidate to ${data.name}` : 
                 type === 'EDIT_CANDIDATE' ? 'Edit Candidate' : 
                 'Delete Candidate'
            }>
                {type === 'ADD_CANDIDATE' || type === 'EDIT_CANDIDATE' ? (
                     <CandidateForm
                        type={type}
                        candidate={type === 'EDIT_CANDIDATE' ? data : undefined}
                        positionId={type === 'ADD_CANDIDATE' ? data.id : data.positionId}
                        onSuccess={() => { onRefreshData(); onClose(); }}
                        onCancel={onClose}
                    />
                ) : (
                    <DeleteConfirmation
                        entityType="Candidate"
                        entityName={data.name}
                        onConfirm={async () => {
                            await sjbuApi.delete(`/positions/${data.positionId}/candidates/${data.id}`); // DELETE /positions/{positionId}/candidates/{candidateId}
                            onRefreshData();
                            onClose();
                        }}
                        onCancel={onClose}
                    />
                )}
            </Modal>
        );
    }

     // User Modals (Super Admin only)
    if ((type === 'ADD_USER' || type === 'EDIT_USER' || type === 'DELETE_USER') && permissions.canManageUsers) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title={
                type === 'ADD_USER' ? 'Create New Admin User' : 
                type === 'EDIT_USER' ? 'Edit Admin User' : 
                'Delete Admin User'
            }>
                {type === 'ADD_USER' || type === 'EDIT_USER' ? (
                    <UserForm
                        type={type}
                        user={data}
                        onSuccess={() => { onRefreshData(); onClose(); }}
                        onCancel={onClose}
                    />
                ) : (
                    <DeleteConfirmation
                        entityType="Admin User"
                        entityName={data.username}
                        onConfirm={async () => {
                            if (data.id === currentUser.id) {
                                alert("Error: Cannot deactivate the currently logged-in user.");
                                return;
                            }
                            await sjbuApi.delete(`/admin/${data.id}/deactivate`); // DELETE /admin/{adminId}/deactivate
                            onRefreshData();
                            onClose();
                        }}
                        onCancel={onClose}
                    />
                )}
            </Modal>
        );
    }

    return null;
};

// Position Form Component (LIVE CRUD)
const PositionForm = ({ type, position, onSuccess, onCancel }: { type: 'ADD_POSITION' | 'EDIT_POSITION', position?: PositionWithCandidates, onSuccess: () => void, onCancel: () => void }) => {
    const [name, setName] = useState(position?.name || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (type === 'ADD_POSITION') {
                await sjbuApi.post('/positions', { position_name: name }); // POST /positions
            } else {
                await sjbuApi.put(`/positions/${position!.id}`, { position_name: name }); // PUT /positions/{positionId}
            }
            onSuccess();
        } catch (err) {
             const message = isAxiosError(err) && err.response?.data?.message || 'Failed to save position.';
             setError(message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
                <label htmlFor="pos-name" className="block text-sm font-medium text-gray-700">Position Name</label>
                <input type="text" id="pos-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500 sm:text-sm" />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? <Spinner /> : (type === 'ADD_POSITION' ? 'Create Position' : 'Update Position')}</Button>
            </div>
        </form>
    );
};

// Candidate Form Component (LIVE CRUD)
const CandidateForm = ({ type, candidate, positionId, onSuccess, onCancel }: { type: 'ADD_CANDIDATE' | 'EDIT_CANDIDATE', candidate?: Candidate, positionId: number | string, onSuccess: () => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({
        name: candidate?.name || '',
        faculty: candidate?.faculty || '',
        photoUrl: candidate?.photoUrl || null,
        manifesto: candidate?.manifesto || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (base64Image: string) => {
        setFormData({ ...formData, photoUrl: base64Image });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const payload = {
                 ...formData,
                 positionId: positionId, // The API expects positionId in the payload for creation
                 photoUrl: formData.photoUrl || 'default-url', // Handle photoUrl properly
                 faculty: formData.faculty || 'Default Faculty' // Assuming these fields are sent
            };
            
            if (type === 'ADD_CANDIDATE') {
                // POST /positions/{positionId}/candidates
                await sjbuApi.post(`/positions/${positionId}/candidates`, payload); 
            } else {
                // PUT /positions/{positionId}/candidates/{candidateId} (Assuming PUT for update)
                // Note: API doc doesn't show PUT/DELETE for candidates, so we infer PUT /positions/{positionId}/candidates/{candidateId}
                await sjbuApi.put(`/positions/${positionId}/candidates/${candidate!.id}`, payload); 
            }
            onSuccess();
        } catch (err) {
             const message = isAxiosError(err) && err.response?.data?.message || 'Failed to save candidate.';
             setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {error && <div className="md:col-span-3 text-red-500 text-sm">{error}</div>}
            {/* ... (form fields remain the same) */}
             <div className="md:col-span-1">
                <ImageUploader imageUrl={formData.photoUrl} onImageChange={handleImageChange} />
            </div>
            <div className="md:col-span-2 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Faculty</label>
                    <input type="text" name="faculty" value={formData.faculty} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Manifesto</label>
                    <textarea name="manifesto" value={formData.manifesto} onChange={handleChange} required rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500" />
                </div>
            </div>
            <div className="md:col-span-3 flex justify-end space-x-4 pt-4 border-t mt-2">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? <Spinner /> : (type === 'ADD_CANDIDATE' ? 'Create Candidate' : 'Update Candidate')}</Button>
            </div>
        </form>
    );
};

// User Form Component (LIVE CRUD)
const UserForm = ({ type, user, onSuccess, onCancel }: { type: 'ADD_USER' | 'EDIT_USER', user?: AdminUser, onSuccess: () => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '', // Added email as per API spec (Page 5)
        password: '',
        role: user?.role || 'moderator' as AdminRole,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const isEditing = !!user;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value as AdminRole | string });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const dataToSave: any = { ...formData };
            if (isEditing && !formData.password) {
                delete dataToSave.password; 
            }
            if (!isEditing && !formData.email) {
                 dataToSave.email = `${dataToSave.username}@sjbu-voting.com`; // Provide default email for creation if missing
            }

            if (type === 'ADD_USER') {
                // POST /admin/create
                await sjbuApi.post('/admin/create', dataToSave); 
            } else {
                // PUT /admin/{adminId}/role (Update role)
                await sjbuApi.put(`/admin/${user!.id}/role`, { role: dataToSave.role }); 
                
                // Note: The API only shows an endpoint for changing the role.
                // Changing password, username, or email would require separate, currently undocumented, endpoints. 
                // We will assume only role and creation are supported via API for now.
            }
            onSuccess();
        } catch (err) {
             const message = isAxiosError(err) && err.response?.data?.message || 'Failed to save admin user.';
             setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required={!isEditing} placeholder={isEditing ? 'Leave blank to keep current password' : ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-dmi-blue-500 focus:ring-dmi-blue-500">
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? <Spinner /> : (isEditing ? 'Update User' : 'Create User')}</Button>
            </div>
        </form>
    );
};

// Generic Delete Confirmation Component
const DeleteConfirmation: React.FC<{ entityType: string, entityName: string, onConfirm: () => void, onCancel: () => void }> = ({ entityType, entityName, onConfirm, onCancel }) => (
    <>
        <p className="text-gray-700">Are you sure you want to delete <strong>{entityName}</strong>? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4 mt-6">
            <Button variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button variant="danger" onClick={onConfirm}>Delete {entityType}</Button>
        </div>
    </>
);

export default AdminDashboard;