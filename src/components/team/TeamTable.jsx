import { RefreshCw, Users } from 'lucide-react';
import TeamMemberRow from './TeamMemberRow';
import Pagination from './Pagination';


export default function TeamTable({teamMembers, loading, pagination, handleRoleChange, handlePageChange, clearFilters, hasActiveFilters}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="p-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">Team Members</h2>
        <span className="text-sm text-muted-foreground">
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
            <div className="px-6 pt-0 overflow-x-auto">
                <table className="min-w-full">
                    <thead className="[&_tr]:border-b">
                        <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">
                                USER
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">
                                ROLE
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">
                                JOINED
                            </th>
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-sm">
                                ACTIONS
                            </th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
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
                <div className="px-6">
                    <div className="border-t border-gray-200 py-4">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            totalUsers={pagination.totalUsers}
                            limit={pagination.limit}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            )}
        </>
    )}
</div>
  )
}
