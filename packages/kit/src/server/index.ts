// Server-only entry for @teligant/horizon-kit.
//
// This barrel is empty in Chapter 1. Chapter 6 (Typed Teligant Adapters) lands
// the real adapter surface here. Server-only credential handling, error
// envelope normalization, and PHI minimization all live behind this entry.
//
// Importing this module from a client bundle is forbidden. When real adapters
// land, this file will export a runtime guard that fails fast if it detects a
// client-side environment.

export {};
