import axiosInstance from './axios-instance';

export type AssetStatus = 'AVAILABLE' | 'ALLOCATED' | 'IN_REPAIR' | 'RETIRED';
export type WorkingCondition = 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';

export type Asset = {
  id: string;
  name: string;
  product: string;
  productName: string;
  serialNumber?: string | null;
  status: AssetStatus;
  productConfiguration?: string | null;
  laptopPin?: string | null;
  laptopPassword?: string | null;
  assetPrice?: number | null;
  dateOfAllocation?: string | null;
  loans?: string | null;
  otherAccessories?: string | null;
  comments?: string | null;
  workingCondition: WorkingCondition;
  previousUser?: string | null;
  allocatedTo?: string | null;
  allocatedToName?: string | null;
  addedByResourceId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAssetPayload = Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAssetPayload = Partial<CreateAssetPayload>;

const getAll = async (status?: AssetStatus): Promise<Asset[]> => {
  const params = status ? { status } : {};
  const response = await axiosInstance.get('/asset-tracking', { params });
  return response.data;
};

const getMyAsset = async (): Promise<Asset[]> => {
  const response = await axiosInstance.get('/asset-tracking/my-asset');
  return response.data;
};

const getById = async (id: string): Promise<Asset> => {
  const response = await axiosInstance.get(`/asset-tracking/${id}`);
  return response.data;
};

const create = async (data: Partial<CreateAssetPayload>): Promise<Asset> => {
  const response = await axiosInstance.post('/asset-tracking', data);
  return response.data;
};

const update = async (id: string, data: UpdateAssetPayload): Promise<Asset> => {
  const response = await axiosInstance.patch(`/asset-tracking/${id}`, data);
  return response.data;
};

const remove = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/asset-tracking/${id}`);
};

export const ASSET_API = {
  getAll,
  getMyAsset,
  getById,
  create,
  update,
  remove,
};
