import { createClient } from '@supabase/supabase-js'

export const supabase = createClient('https://klascnkpthlazmfdeaen.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsYXNjbmtwdGhsYXptZmRlYWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMyOTA0NTAsImV4cCI6MjAyODg2NjQ1MH0.NibvBTVrDYyWH091xdkiPEJJ7bRbkDXp1VAq8pdiGy8')