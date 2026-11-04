import { unwrap, votingApi } from '../../shared/api/client';

export const guestVotingRequests = {
  poll: (code: string) => unwrap(votingApi.GET('/api/public/polls/{code}', { params: { path: { code } } })),
  castVote: (code: string, choice: 'A' | 'B') =>
    unwrap(votingApi.POST('/api/public/polls/{code}/votes', { params: { path: { code } }, body: { choice } })),
};
