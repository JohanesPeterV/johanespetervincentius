import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { BaseColor } from "@/registry/registry-base-colors";

type Config = {
  theme: BaseColor["name"];
  scrollSectionIndex: number;
};

const configAtom = atomWithStorage<Config>("config", {
  theme: "zinc",
  scrollSectionIndex: 0,
});

export function useConfig() {
  return useAtom(configAtom);
}
