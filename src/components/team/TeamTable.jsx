import { RefreshCw, Users } from 'lucide-react';
import TeamMemberRow from './TeamMemberRow';
import Pagination from './Pagination';


export default function TeamTable({teamMembers, loading, pagination, handleRoleChange, handlePageChange, clearFilters, hasActiveFilters}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        <span className="text-sm text-gray-500">
            {loading ? 'Loading...' : pagination ? `${pagination.totalUsers} total members` : '0 members'}
        </span>
    </div>

    {loading ? (
        <div className="px-6 py-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Loading team members...</p>
        </div>
    ) : teamMembers.length === 0 ? (
        <div className="px-6 py-8 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">
                {hasActiveFilters 
                    ? 'No members found matching your filters' 
                    : 'No team members found'}
            </p>
            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                    Clear filters
                </button>
            )}
        </div>
    ) : (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                USER
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ROLE
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                JOINED
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ACTIONS
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {teamMembers.map((member) => (
                            <TeamMemberRow
                                key={member.id}
                                member={member}
                                onRoleChange={handleRoleChange}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalUsers={pagination.totalUsers}
                        limit={pagination.limit}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </>
    )}
</div>
  )
}
