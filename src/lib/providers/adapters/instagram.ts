import type { MediaProvider } from "../types";
import { resolveViaProvider } from "./shared";

/** Real instagram adapter — resolves through AllDL via the shared client. */
export const instagramProvider: MediaProvider = { resolve: resolveViaProvider };
