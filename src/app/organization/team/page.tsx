'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MoreVertical,
  Mail,
  Shield,
  UserPlus,
  UserMinus,
  Users,
  Crown,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserContext } from '@/contexts/UserContextProvider';

interface Member {
  id: string;
  user_full_name: string;
  user_email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'pending' | 'active' | 'suspended' | 'revoked';
  is_primary: boolean;
  created_at: string;
}

const roleConfig: Record<string, { label: string; color: string; icon: typeof Crown }> = {
  owner: { label: 'เจ้าของ', color: 'bg-amber-100 text-amber-700', icon: Crown },
  admin: { label: 'ผู้ดูแล', color: 'bg-purple-100 text-purple-700', icon: Shield },
  member: { label: 'สมาชิก', color: 'bg-blue-100 text-blue-700', icon: Users },
  viewer: { label: 'ผู้ดู', color: 'bg-gray-100 text-gray-700', icon: User },
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: 'ใช้งานอยู่', color: 'text-emerald-600', icon: CheckCircle },
  pending: { label: 'รอยืนยัน', color: 'text-amber-600', icon: Clock },
  suspended: { label: 'ระงับ', color: 'text-red-600', icon: XCircle },
  revoked: { label: 'ถูกยกเลิก', color: 'text-gray-400', icon: XCircle },
};

export default function TeamPage() {
  const { contextId } = useUserContext();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Fetch members from backend
  const fetchMembers = useCallback(async () => {
    if (!contextId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/organizations/${contextId}/members`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data.members || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setIsLoading(false);
    }
  }, [contextId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Invite member
  const handleInvite = async () => {
    if (!contextId || !inviteEmail) return;

    setInviteLoading(true);
    setInviteError(null);

    try {
      const response = await fetch(`/api/organizations/${contextId}/members/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
      fetchMembers();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const visibleMembers = members.filter(m => m.status !== 'revoked');
  const filteredMembers = visibleMembers.filter((member) =>
    member.user_full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMembers = visibleMembers.filter((m) => m.status === 'active').length;
  const pendingInvites = visibleMembers.filter((m) => m.status === 'pending').length;
  const adminCount = visibleMembers.filter((m) => m.role === 'admin' || m.role === 'owner').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-500">กำลังโหลด...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchMembers}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">จัดการทีม</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">เชิญและจัดการสมาชิกในทีมขององค์กร</p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          เชิญสมาชิก
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeMembers}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">สมาชิกที่ใช้งาน</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingInvites}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">รอการยืนยัน</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{adminCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">ผู้ดูแล</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาสมาชิก..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
        />
      </div>

      {/* Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">สมาชิก</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">บทบาท</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">สถานะ</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">วันที่เข้าร่วม</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredMembers.map((member) => {
                const role = roleConfig[member.role] || roleConfig.member;
                const status = statusConfig[member.status] || statusConfig.active;
                const RoleIcon = role.icon;
                const StatusIcon = status.icon;
                const displayName = member.user_full_name || member.user_email;
                const joinDate = member.created_at
                  ? new Date(member.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
                  : '-';

                return (
                  <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white">{displayName}</p>
                            {member.is_primary && (
                              <span className="text-xs px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded">หลัก</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{member.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full', role.color)}>
                        <RoleIcon className="w-3.5 h-3.5" />
                        {role.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-flex items-center gap-1.5 text-sm', status.color)}>
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {joinDate}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.role !== 'owner' && (
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === member.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                {member.status === 'pending' && (
                                  <button
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    onClick={() => setOpenMenuId(null)}
                                  >
                                    <Mail className="w-4 h-4" />
                                    ส่งคำเชิญอีกครั้ง
                                  </button>
                                )}
                                <hr className="my-1 border-gray-100 dark:border-gray-700" />
                                <button
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <UserMinus className="w-4 h-4" />
                                  ลบออกจากทีม
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">ไม่พบสมาชิกที่ตรงกับการค้นหา</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">เชิญสมาชิกใหม่</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">อีเมล</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@company.com"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">บทบาท</label>
                <div className="flex gap-3">
                  <label className={cn(
                    'flex-1 flex items-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors',
                    inviteRole === 'admin'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}>
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={inviteRole === 'admin'}
                      onChange={() => setInviteRole('admin')}
                      className="text-primary-600"
                    />
                    <div>
                      <span className="text-sm font-medium dark:text-white">ผู้ดูแล</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">จัดการทีมและ API</p>
                    </div>
                  </label>
                  <label className={cn(
                    'flex-1 flex items-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors',
                    inviteRole === 'member'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}>
                    <input
                      type="radio"
                      name="role"
                      value="member"
                      checked={inviteRole === 'member'}
                      onChange={() => setInviteRole('member')}
                      className="text-primary-600"
                    />
                    <div>
                      <span className="text-sm font-medium dark:text-white">สมาชิก</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">เข้าถึง API เท่านั้น</p>
                    </div>
                  </label>
                </div>
              </div>

              {inviteError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {inviteError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail('');
                  setInviteError(null);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail || inviteLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                ส่งคำเชิญ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
