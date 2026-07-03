// Compile-time-only nominal typing for GTA$ calculation results. Each branded
// type is `number` intersected with a phantom property keyed by a unique
// symbol -- the symbol never exists at runtime, so these values ARE plain
// numbers in JS (JSON.stringify, characterization goldens, arithmetic all see
// a bare number). The brand only prevents TypeScript from letting a Days
// value flow into a slot that expects Hours, etc., at public API boundaries.
//
// Smart constructors (asDollars/asIncome/...) are the one place a plain
// number is cast into a branded type; call them at the edge where a raw
// number enters a branded API (tests, or a future .ts caller). Untyped .jsx
// callers are unaffected -- values crossing into a JS file are inferred as
// `any`, so no cast is required there.

declare const DollarsBrand: unique symbol;
/** A GTA$ amount (price, cash on hand, cost). */
export type Dollars = number & { readonly [DollarsBrand]: true };

declare const IncomeBrand: unique symbol;
/** A GTA$/hour rate. */
export type Income = number & { readonly [IncomeBrand]: true };

declare const HoursBrand: unique symbol;
/** A duration in hours. */
export type Hours = number & { readonly [HoursBrand]: true };

declare const DaysBrand: unique symbol;
/** A duration in days. */
export type Days = number & { readonly [DaysBrand]: true };

export const asDollars = (value: number): Dollars => value as Dollars;
export const asIncome = (value: number): Income => value as Income;
export const asHours = (value: number): Hours => value as Hours;
export const asDays = (value: number): Days => value as Days;
