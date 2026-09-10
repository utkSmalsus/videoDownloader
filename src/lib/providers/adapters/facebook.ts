import type { MediaProvider } from "../types";
import { resolveViaProvider } from "./shared";

/** Real facebook adapter — resolves through AllDL via the shared client. */
export const facebookProvider: MediaProvider = { resolve: resolveViaProvider };
