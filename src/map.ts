import { get } from "lodash";

export const mapByPath = <T, U>(arr: T[], keyPath: string | string[]): U[] => arr.map(item => get(item, keyPath))