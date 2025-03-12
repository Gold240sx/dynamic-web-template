"use client";

import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsBoolean,
} from "nuqs";

export function useNuqsBoolean(key: string, defaultValue: boolean) {
  return useQueryState(key, parseAsBoolean.withDefault(defaultValue));
}

export function useNuqsNumber(key: string, defaultValue: number) {
  return useQueryState(key, parseAsInteger.withDefault(defaultValue));
}

export function useNuqsString(key: string, defaultValue: string) {
  return useQueryState(key, parseAsString.withDefault(defaultValue));
}
