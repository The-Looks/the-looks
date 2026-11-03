import { outfitApi, unwrap, votingApi } from '../../shared/api/client';

export const votingRequests = {
  myPolls: () => unwrap(votingApi.GET('/api/app/polls')),
  outfitChoices: () => unwrap(outfitApi.GET('/api/app/outfits')),
  createPoll: (body: { outfitAId: string; outfitBId: string; question?: string; ttlHours?: number }) =>
    unwrap(votingApi.POST('/api/app/polls', { body })),
};
