const { createClient } = require('@supabase/supabase-js');
const url = 'https://ebyjzoxpbgbhehxrijpp.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVieWp6b3hwYmdiaGVoeHJpanBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Nzk4ODMsImV4cCI6MjA4NjA1NTg4M30.r7e8Tkzi7vTQKiRyXK2lE9L8478jyjQEkdJeqKmNrCI';
const supabase = createClient(url, key);

async function test() {
    const { data: d } = await supabase.from('devices').select('*');
    const { data: t } = await supabase.from('device_pairing_tokens').select('*');
    console.log('Devices in DB:', JSON.stringify(d, null, 2));
    console.log('Tokens in DB:', JSON.stringify(t, null, 2));
}
test().catch(console.error);
