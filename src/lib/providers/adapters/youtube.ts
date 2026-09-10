import type { MediaProvider } from "../types";
import { resolveViaProvider } from "./shared";

/** Real youtube adapter — resolves through AllDL via the shared client. */
export const youtubeProvider: MediaProvider = { resolve: resolveViaProvider };
