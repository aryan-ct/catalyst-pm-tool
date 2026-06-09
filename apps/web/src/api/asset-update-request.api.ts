import axiosInstance from './axios-instance';

export type UpdateRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ChangeEntry = { from: string; to: string };

export type AssetUpdateRequest = {
  id: string;
  assetId: string;
  assetName: string;
  requestedById: string;
  requestedByName: string;
  requestedChanges: Record<string, ChangeEntry>;
  reason?: string | null;
  status: UpdateRequestStatus;
  hrComment?: string | null;
  reviewedById?: string | null;
  reviewedByName?: string | null;
  createdAt: string;
  updatedAt: string;
};

const getAll = async (status?: UpdateRequestStatus): Promise<AssetUpdateRequest[]> => {
  const params = status ? { status } : {};
  const res = await axiosInstance.get('/asset-update-requests', { params });
  return res.data;
};

const getPendingCount = async (): Promise<number> => {
  const res = await axiosInstance.get('/asset-update-requests/pending-count');
  return res.data;
};

const create = async (data: {
  assetId: string;
  requestedChanges: Record<string, ChangeEntry>;
  reason?: string;
}): Promise<AssetUpdateRequest> => {
  const res = await axiosInstance.post('/asset-update-requests', data);
  return res.data;
};

const approve = async (id: string, hrComment?: string): Promise<void> => {
  await axiosInstance.patch(`/asset-update-requests/${id}/approve`, { hrComment });
};

const reject = async (id: string, hrComment?: string): Promise<void> => {
  await axiosInstance.patch(`/asset-update-requests/${id}/reject`, { hrComment });
};

export const ASSET_REQUEST_API = { getAll, getPendingCount, create, approve, reject };
