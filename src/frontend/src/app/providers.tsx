'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import type { SupabaseClient } from '@supabase/supabase-js';

const SupabaseContext = createContext<SupabaseClient | undefined>(undefined);

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  return (
    <SupabaseContext.Provider value={supabase}>
      <SessionContextProvider supabaseClient={supabase}>
        {children}
      </SessionContextProvider>
    </SupabaseContext.Provider>
  );
}