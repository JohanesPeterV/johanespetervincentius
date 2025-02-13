import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

import { BaseColor } from "@/registry/registry-base-colors"

type Config = {
  theme: BaseColor["name"]
}

const configAtom = atomWithStorage<Config>("config", {
  theme: "zinc",

})

export function useConfig() {
  return useAtom(configAtom)
}
