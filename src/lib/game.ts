
import { createClient } from '@supabase/supabase-js'

type Game = {
  p1: string[];
  p2: string[];
  gameId: string | null;
};

import { get, writable } from "svelte/store";

// Create a new store with the given data.
export const state = writable<Game>({
  gameId: null,
  p1: [],
  p2: []
});

export const connect = async (name: string, joinGameId: string | null) => {
  
 
  
    
  });
};