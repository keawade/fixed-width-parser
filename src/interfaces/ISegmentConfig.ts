export type ISegmentConfig = IUniqueConfig & Partial<IDefaultableConfig>;

export interface IDefaultableConfig {
  padding: {
    character: string;
    direction: 'start' | 'end';
    trim: boolean;
  };
}

export interface IUniqueConfig {
  type: string;
  name: string;
  start: number;
  width: number;
}
