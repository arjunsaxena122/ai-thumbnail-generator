import { IImageStore, TFile } from "@/types/image.type";
import { create } from "zustand";

export const useImageStore = create<IImageStore>((set) => ({
  file: {},
  setFile: ({ name, type, size, lastModified }) =>
    set({ file: { name, type, size, lastModified } }),
}));
