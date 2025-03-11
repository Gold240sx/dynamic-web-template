import { useMemo } from "react";

export function useNameFormatter(name: string | null | undefined) {
  return useMemo(() => {
    if (!name) return undefined;

    // Remove periods and commas
    const firstStr = name.replaceAll(".", "").replaceAll(",", "");

    // Replace two letter words with first letter and period
    const secndStr = firstStr.replace(/(\b\w{2}\b)/g, "$1.");

    // Replace one letter words with letter and period
    const thirdStr = secndStr.replace(/(\b\w{1}\b)/g, "$1.");

    // Handle js pattern
    const fourthStr = thirdStr.replace(/\b([a-zA-Z])([a-zA-Z])\b/g, "$1.$2");

    // Handle special cases jr and sr
    const fifthStr = fourthStr
      .replaceAll("j.r.", "jr.")
      .replaceAll("s.r.", "sr.");

    // Handle final string formatting
    const lastString = (string: string) => {
      if (string[string.length - 3] === ".") {
        const partOne = string.slice(0, -3);
        const partTwo = string.slice(-2, -1);
        return partOne + partTwo;
      }
      return string;
    };

    return lastString(fifthStr);
  }, [name]);
}
