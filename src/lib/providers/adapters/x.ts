import type { MediaProvider } from "../types";
import { resolveViaProvider } from "./shared";

/** Real x adapter — resolves through AllDL via the shared client. */
export const xProvider: MediaProvider = { resolve: resolveViaProvider };
