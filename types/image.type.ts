export type TFile = {
  name: string;
  type: string;
  size: number;
  lastModified: number;
};

export interface IImageStore {
  file: TFile | object;
  setFile: (file: TFile) => void;
}
