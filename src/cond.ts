/**
 * @description More succinct analogy of switch. Reusable. It accepts cases for a first call, that could be assigned values, or functions that return some value, and key for an cases object for a second call, that will return value pertaining to that specific case.
 * @param cases An object of possible cases that can be accepted.
 * @returns Function that accepts key of cases that would be matched against cases object and specific value returned for a selected case. Tip: when saved to variable, cases can be reused across multiple calls with various case keys.
 */
export const choose =
  <T extends { [k in keyof T]: T[k] }>(cases: T) =>
  <U extends keyof T>(caseKey: U): T[U] extends () => unknown ? ReturnType<T[U]> : T[U] => {
    const choosedCase = cases[caseKey];

    return typeof choosedCase === "function" ? choosedCase() : choosedCase;
  };

